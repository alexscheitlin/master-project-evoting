import express from 'express'
import fs from 'fs'
import path from 'path'

import { AuthBackend } from '../services'

const router: express.Router = express.Router()

// messages
const WALLET_REGISTERED_MSG: string = 'Wallet successfully registered!'
const WALLET_NOT_REGISTERED_MSG: string = 'Wallet not registed with authority.'

// read out wallet address
const wallet = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../wallet/sealer.json'), 'utf8'))
const addressToRegister = '0x' + wallet.address

router.post('/register', async (req, res) => {
  // Send wallet address to authority backend to register
  try {
    AuthBackend.registerWallet(addressToRegister)
    res.status(200).json({ msg: WALLET_REGISTERED_MSG, address: addressToRegister })
  } catch (error) {
    res.status(400).json({ msg: WALLET_NOT_REGISTERED_MSG })
  }
})

router.get('/register', async (req, res) => {
  if (addressToRegister !== '' || addressToRegister !== undefined) {
    res.status(200).json({ result: addressToRegister })
  } else {
    res.status(400).json({ result: 'No Address available..' })
  }
})

export default router
