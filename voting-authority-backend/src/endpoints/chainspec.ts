import express from 'express'

import { verifyAddress } from '../utils/addressVerification'
import { getValueFromDB, getObjectFromDB, setValue } from '../database/database'

const SUCCESS_MSG: string = 'Successfully registered authority address.'
const ADDRESS_INVALID: string = 'Address registration failed. Address is not valid or has already been registered.'
const AUTHORITY_REGISTRATION_CLOSED: string = 'Authority registration is closed. Cannot register Authority address.'

// database tables
const REGISTERED_AUTHORITIES: string = 'authorities'
const DEFAULT_CHAINSPEC: string = 'defaultChainspec'
const CHAINSPEC: string = 'chainspec'
const VOTING_STATE: string = 'state'

const router: express.Router = express.Router()

router.get('/chainspec', (req, res) => {
  const state: string = <string>getValueFromDB(VOTING_STATE)

  // REGISTER -> returns default chainspec for authority account creation
  if (state === 'REGISTER') {
    const defaultConfig = getObjectFromDB(DEFAULT_CHAINSPEC)
    res.status(200).json(defaultConfig)
  }
  // STARTUP -> returns the new chainspec containing all authority addresses
  else {
    const customConfig = getObjectFromDB(CHAINSPEC)
    res.status(200).json(customConfig)
  }
})

// TODO: adjust to new states, see state.ts

router.post('/chainspec', (req, res) => {
  const state: string = <string>getValueFromDB(VOTING_STATE)

  // no longer allow authority registration once the voting state has changed to VOTING
  if (state === 'VOTING') {
    res.status(400).json({ created: false, msg: AUTHORITY_REGISTRATION_CLOSED })
  }

  // validate authority ethereum address
  const voterAddress: string = req.body.address
  const isAddressValid: boolean = verifyAddress(REGISTERED_AUTHORITIES, voterAddress)

  if (!isAddressValid) {
    res.status(400).json({ created: false, msg: ADDRESS_INVALID })
  }

  // update list of validators
  const oldChainspec: any = getObjectFromDB(CHAINSPEC)

  try {
    const newChainspec: any = addValidatorToChainspec(oldChainspec, voterAddress)
    setValue(CHAINSPEC, newChainspec)
    res.status(201).json({ created: true, msg: SUCCESS_MSG })
  } catch (error) {
    res.status(400).json({ created: false, msg: error.message })
  }
})

export const addValidatorToChainspec = (chainspec: any, address: string): any => {
  if (chainspec === null || typeof chainspec === undefined) {
    throw new TypeError('Cannot read chainspec since it is null.')
  }

  const validators: string[] = chainspec['engine']['authorityRound']['params']['validators']['list']

  if (validators === null || typeof validators === undefined) {
    throw new TypeError('Validators cannot be retrieved from chainspec since it is null.')
  }

  // updates the list of current validators in the current chainspec
  validators.push(address)
  chainspec['engine']['authorityRound']['params']['validators']['list'] = validators
  return chainspec
}

export default router
