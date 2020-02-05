import express from 'express'
import {
  addToList,
  AUTHORITIES_TABLE,
  CHAINSPEC_TABLE,
  getObjectFromDB,
  getValueFromDB,
  setValue,
  STATE_TABLE,
} from '../database/database'
import { verifyAddress } from '../utils/addressVerification'
import { parityConfig } from '../config'

const SUCCESS_MSG: string = 'Successfully registered authority address.'
const ADDRESS_INVALID: string = 'Address registration failed. Address is not valid or has already been registered.'
const AUTHORITY_REGISTRATION_ONGOING: string = 'Authority registration is ongoing. Please wait until it is finished.'
const AUTHORITY_REGISTRATION_CLOSED: string = 'Authority registration is closed. Cannot register Authority address.'

const router: express.Router = express.Router()

export const addValidatorToChainspec = (chainspec: any, address: string): any => {
  if (chainspec === null || typeof chainspec === 'undefined') {
    throw new TypeError('Cannot read chainspec since it is null.')
  }

  // updates the list of current validators in the current chainspec
  const validators: string[] = chainspec['engine']['authorityRound']['params']['validators']['list']
  if (validators === null || typeof validators === 'undefined') {
    throw new TypeError('Validators cannot be retrieved from chainspec since it is null.')
  }
  validators.push(address)
  chainspec['engine']['authorityRound']['params']['validators']['list'] = validators

  // pre-fund validator
  const accounts: any = chainspec['accounts']
  if (accounts === null || typeof accounts === 'undefined') {
    throw new TypeError('Accounts cannot be retrieved from chainspec since it is null.')
  }
  accounts[`${address}`] = { balance: '10000000000000000000000' }
  chainspec['accounts'] = accounts

  return chainspec
}

router.get('/chainspec', (req, res) => {
  const state: string = getValueFromDB(STATE_TABLE) as string
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes
  const registeredAuthorities: string[] = getValueFromDB(AUTHORITIES_TABLE) as string[]

  // REGISTRATION -> returns default chainspec for authority account creation
  if (state === 'REGISTRATION') {
    res.status(400).json({
      msg: AUTHORITY_REGISTRATION_ONGOING,
      registeredSealers: registeredAuthorities.length,
      requiredSealers: requiredAuthorities,
    })
  }
  // PAIRING -> returns the chainspec containing all authority addresses
  else {
    const customConfig = getObjectFromDB(CHAINSPEC_TABLE)
    res.status(200).json(customConfig)
  }
})

router.post('/chainspec', (req, res) => {
  const state: string = getValueFromDB(STATE_TABLE) as string

  // no longer allow authority registration once the voting state has changed to PAIRING
  if (state !== 'REGISTRATION') {
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
    // add validator to chainspec
    const newChainspec: any = addValidatorToChainspec(oldChainspec, voterAddress)
    setValue(CHAINSPEC_TABLE, newChainspec)

    res.status(201).json({ created: true, msg: SUCCESS_MSG })
  } catch (error) {
    res.status(400).json({ created: false, msg: error.message })
  }
})

export default router
