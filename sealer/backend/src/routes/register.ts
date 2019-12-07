import express from 'express'
const router: express.Router = express.Router()

// messages
const WALLET_REGISTERED_MSG: string = 'Wallet successfully registered!'

router.post('/register', async (req, res) => {
  const addressToRegister = req.body.address

  // Read wallet address (publicAddress)

  // Send wallet address to authority backend to register

  // subscribe to changes

  // as soon as all nodes have registered themselves with the authority backend,
  // this backend should fetch the final chainspec.json

  res.status(200).json({ msg: WALLET_REGISTERED_MSG })
})

export default router
