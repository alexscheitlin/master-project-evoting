import express from 'express'

const router: express.Router = express.Router()

// messages
const SUCESS_MSG: string = 'Sealer ETH Address successfully registered with the Authority!'

router.get('/generateKeys', (req, res) => {
  // get the ballot contract address from the auth backend

  // get the system parameters from the contract

  // generate keyPair

  // save privateKey

  // submit publicKey to the Ballot contract

  res.status(200).json({ msg: SUCESS_MSG })
})

export default router
