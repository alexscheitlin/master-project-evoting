import express from 'express'
import { addToList, AUTHORITIES_TABLE, CHAINSPEC_TABLE, getObjectFromDB, getValueFromDB, setValue, STATE_TABLE } from '../database/database'
import { verifyAddress } from '../utils/addressVerification'
import { parityConfig } from '../config'

const SUCCESS_MSG: string = 'Successfully registered authority address.'
const ADDRESS_INVALID: string = 'Address registration failed. Address is not valid or has already been registered.'
const AUTHORITY_REGISTRATION_ONGOING: string = 'Authority registration is ongoing. Please wait until it is finished.'
const AUTHORITY_REGISTRATION_CLOSED: string = 'Authority registration is closed. Cannot register Authority address.'

let clients: RegisteredClient[] = []

const router: express.Router = express.Router()

interface RegisteredClient {
  id: number
  res: express.Response
}

router.get('/registered', (req: express.Request, res: express.Response) => {
  // Mandatory headers and http status to keep connection open
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  }
  res.writeHead(200, headers)

  // Get existing validators from DB
  const chainspec: any = getObjectFromDB(CHAINSPEC_TABLE)
  const validators: string[] = chainspec['engine']['authorityRound']['params']['validators']['list']

  // After client opens connection send all nests as string
  const data = `data: ${JSON.stringify(validators)}\n\n`
  res.write(data)

  // Generate an id based on timestamp and save res
  // object of client connection on clients list
  // Later we'll iterate it and send updates to each client
  const clientId = Date.now()
  const newClient: RegisteredClient = {
    id: clientId,
    res,
  }
  clients.push(newClient)

  // When client closes connection we update the clients list avoiding the disconnected one
  req.on('close', () => {
    console.log(`${clientId} Connection closed`)
    clients = clients.filter(c => c.id !== clientId)
  })
})

const sendValidatorToAllClients = (newValidator: string) => {
  clients.forEach(c => c.res.write(`data: ${JSON.stringify([newValidator])}\n\n`))
}

router.get('/chainspec', (req, res) => {
  const state: string = <string>getValueFromDB(STATE_TABLE)
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes
  const registeredAuthorities: string[] = <string[]>getValueFromDB(AUTHORITIES_TABLE)

  // REGISTER -> returns default chainspec for authority account creation
  if (state === 'REGISTER') {
    res.status(400).json({
      msg: AUTHORITY_REGISTRATION_ONGOING,
      registeredSealers: registeredAuthorities.length,
      requiredSealers: requiredAuthorities,
    })
  }
  // STARTUP -> returns the chainspec containing all authority addresses
  else {
    const customConfig = getObjectFromDB(CHAINSPEC_TABLE)
    res.status(200).json(customConfig)
  }
})

router.post('/chainspec', (req, res) => {
  const state: string = <string>getValueFromDB(STATE_TABLE)

  // no longer allow authority registration once the voting state has changed to STARTUP
  if (state !== 'REGISTER') {
    res.status(400).json({ created: false, msg: AUTHORITY_REGISTRATION_CLOSED })
    return
  }

  // validate authority ethereum address
  const voterAddress: string = req.body.address
  const isAddressValid: boolean = verifyAddress(AUTHORITIES_TABLE, voterAddress)

  if (!isAddressValid) {
    res.status(400).json({ created: false, msg: ADDRESS_INVALID })
    return
  }

  // update list of validators
  const oldChainspec: any = getObjectFromDB(CHAINSPEC_TABLE)
  addToList(AUTHORITIES_TABLE, [voterAddress])

  try {
    // create the new chainspec
    const newChainspec: any = addValidatorToChainspec(oldChainspec, voterAddress)
    setValue(CHAINSPEC_TABLE, newChainspec)

    // update all registered clients -> send the new validator
    sendValidatorToAllClients(voterAddress)
    res.status(201).json({ created: true, msg: SUCCESS_MSG })
  } catch (error) {
    res.status(400).json({ created: false, msg: error.message })
  }
})

export const addValidatorToChainspec = (chainspec: any, address: string): any => {
  if (chainspec === null || typeof chainspec === undefined) {
    throw new TypeError('Cannot read chainspec since it is null.')
  }

  // updates the list of current validators in the current chainspec
  const validators: string[] = chainspec['engine']['authorityRound']['params']['validators']['list']
  if (validators === null || typeof validators === undefined) {
    throw new TypeError('Validators cannot be retrieved from chainspec since it is null.')
  }
  validators.push(address)
  chainspec['engine']['authorityRound']['params']['validators']['list'] = validators

  // pre-fund validator
  const accounts: any = chainspec['accounts']
  if (accounts === null || typeof accounts === undefined) {
    throw new TypeError('Accounts cannot be retrieved from chainspec since it is null.')
  }
  accounts[`${address}`] = { balance: '10000000000000000000000' }
  chainspec['accounts'] = accounts

  return chainspec
}

export default router
