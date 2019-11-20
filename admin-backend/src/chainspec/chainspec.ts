import express from 'express'
import fs from 'fs'

import { verifyAddress } from '../utils'
import { getValueFromDB } from '../database/database'

const SUCCESS_MSG: string = 'Successfully registered authority address.'
const ADDRESS_INVALID: string = 'Address registration failed. Address is not valid or has already been registered.'
const REGISTERED_AUTHORITIES: string = 'authorities'

const defaultConfig = JSON.parse(fs.readFileSync('./src/chainspec/defaultChainspec.json', 'utf-8'))

const router: express.Router = express.Router()

router.get('/chainspec', (req, res) => {
  const state: string = getValueFromDB('state')
  console.log(state)

  // PRE_VOTING -> returns default chainspec for authority account creation
  if (state === 'PRE_VOTING') {
    res.status(200).json(defaultConfig)
  }
  // VOTING -> returns the new chainspec containing all authority addresses
  else {
    // TODO: Implement how the default config is adjusted to included the registered authority addresses
    const customConfig = defaultConfig
    res.status(200).json(customConfig)
  }
})

router.post('/chainspec', (req, res) => {
  const voterAddress: string = req.body.address
  const isAddressValid: boolean = verifyAddress(REGISTERED_AUTHORITIES, voterAddress)

  if (isAddressValid) {
    res.status(201).json({ created: true, msg: SUCCESS_MSG })
  } else {
    res.status(400).json({ created: false, msg: ADDRESS_INVALID })
  }
})

export default router
