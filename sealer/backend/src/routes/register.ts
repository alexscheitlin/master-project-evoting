import express from 'express'

import { AuthBackend } from '../services'
import { Account } from '../utils'

const router: express.Router = express.Router()

// messages
const WALLET_REGISTERED_MSG: string = 'Wallet successfully registered!'
const WALLET_NOT_REGISTERED_MSG: string = 'Wallet not registed with authority.'

router.post('/register', async (req, res) => {
  const addressToRegister = Account.getWallet()

  // Send wallet address to authority backend to register
  try {
    AuthBackend.registerWallet(addressToRegister)
    res.status(200).json({ msg: WALLET_REGISTERED_MSG, address: addressToRegister })
    return
  } catch (error) {
    res.status(400).json({ msg: WALLET_NOT_REGISTERED_MSG })
    return
  }
})

router.get('/register', async (req, res) => {
  const addressToRegister = Account.getWallet()
  if (addressToRegister !== '' || addressToRegister !== undefined) {
    res.status(200).json({ result: addressToRegister })
    return
  } else {
    res.status(400).json({ result: 'No Address available..' })
    return
  }
})

export default router
