import axios from 'axios'
import express from 'express'
import fs from 'fs'
import path from 'path'

import { config } from '../config'

const router: express.Router = express.Router()

// messages
const WALLET_REGISTERED_MSG: string = 'Wallet successfully registered!'
const WALLET_NOT_REGISTERED_MSG: string = 'Wallet not registed with authority.'

router.post('/register', async (req, res) => {
  // read out wallet address
  const wallet = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../wallet/sealer.json'), 'utf8'))
  const addressToRegister = '0x' + wallet.address

  // Send wallet address to authority backend to register
  try {
    await axios.post(config.authBackend.devUrl + '/chainspec', {
      address: addressToRegister,
    })
    res.status(200).json({ msg: WALLET_REGISTERED_MSG, address: addressToRegister })
  } catch (error) {
    res.status(400).json({ msg: WALLET_NOT_REGISTERED_MSG })
  }

  // TODO: if possible subscribe to nr of registered sealer -> to know when to download chainspec
})

router.get('/register', async (req, res) => {
  // read out wallet address
  const wallet = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../wallet/sealer.json'), 'utf8'))
  const addressToRegister = '0x' + wallet.address

  if (addressToRegister !== '' || addressToRegister !== undefined) {
    res.status(200).json({ result: addressToRegister })
  } else {
    res.status(400).json({ result: 'No Address available..' })
  }
})

export default router
