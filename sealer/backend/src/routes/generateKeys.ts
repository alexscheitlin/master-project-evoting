import express from 'express'
import { FFelGamal } from '@meck93/evote-crypto'

import { BALLOT_ADDRESS_TABLE, PRIVATE_KEY_SHARE_TABLE, PUBLIC_KEY_SHARES_TABLE, setValue } from '../database/database'
import { AuthBackend, BallotManager } from '../services'
import { Account } from '../utils'

const router: express.Router = express.Router()

router.post('/generateKeys', async (req, res) => {
  try {
    // get the ballot address from the auth-backend
    const contractAddress = await AuthBackend.getBallotAddress()
    setValue(BALLOT_ADDRESS_TABLE, contractAddress)
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: 'Unable to get the ballot address from the ballot contract.' })
    return
  }

  let systemParameters

  try {
    const sysParamsFromContract = await BallotManager.getSystemParameters()
    systemParameters = BallotManager.toSystemParams(sysParamsFromContract)
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: 'Unable to get the system parameters from the ballot contract.' })
    return
  }

  // generate keyshare
  const keyShare: FFelGamal.KeyPair = FFelGamal.SystemSetup.generateKeyPair(systemParameters)

  // store private key share for later
  setValue(PUBLIC_KEY_SHARES_TABLE, keyShare.h.toJSON())
  setValue(PRIVATE_KEY_SHARE_TABLE, keyShare.sk.toJSON())

  const uniqueID = Account.getWallet()
  const keyGenProof = FFelGamal.Proof.KeyGeneration.generate(systemParameters, keyShare, uniqueID)

  try {
    // sealer adds it's public key share to the contract
    await BallotManager.submitPublicKeyShare(keyShare, keyGenProof)

    res.status(200).json({ msg: 'Successfully submitted public key share to the ballot contract.' })
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: 'Unable submit the public key share to the ballot contract.' })
  }
})

export default router
