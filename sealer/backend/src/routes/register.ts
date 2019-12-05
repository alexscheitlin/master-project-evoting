import express from 'express'

import { runScript } from '../utils/shell'

const router: express.Router = express.Router()

// messages
const WALLET_REGISTERED_MSG: string = 'Wallet successfully registered!'

router.post('/register', async (req, res) => {
  // const { stdout, stderr } = await runScript('src/scripts/test.sh')

  const addressToRegister = req.body.address

  console.log('...will register:', addressToRegister)

  // Read wallet address created (keyStore)

  // Send wallet address to authority backend to register

  // subscribe to changes (as soon as chainspec is ready, the node can be started)

  res.status(200).json({ msg: WALLET_REGISTERED_MSG })
})

export default router
