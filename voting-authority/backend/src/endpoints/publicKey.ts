import BN from 'bn.js'
import express from 'express'

import { parityConfig } from '../config'
import { getValueFromDB, STATE_TABLE } from '../database/database'
import { BallotManager } from '../utils/ballotManager'
import { VotingState } from './state'

const TOO_EARLY_MSG: string = 'You are too early to create the public key. Please wait for the CONFIG stage.'
const TOO_LATE_MSG: string = 'You are too late to create the public key. You should have done that during the CONFIG stage.'
const KEYSHARE_GENERATION_ONGOING: string = 'The key share generation is ongoing. Please wait until it is finished.'
const PUBLIC_KEY_ALREADY_GENERATED: string = 'The public key was already generated.'
const SUCCESSFUL: string = 'The public key generation was successful!'

const router: express.Router = express.Router()

router.post('/publickey', async (req, res) => {
  const currentState: string = <string>getValueFromDB(STATE_TABLE)
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes

  switch (currentState) {
    case VotingState.REGISTER:
      res.status(400).json({ msg: TOO_EARLY_MSG })
      return
    case VotingState.STARTUP:
      res.status(400).json({ msg: TOO_EARLY_MSG })
      return
    case VotingState.CONFIG:
      let publicKey: BN

      // check if the public key was already created
      try {
        publicKey = await BallotManager.getPublicKey()
        res.status(409).json({ msg: PUBLIC_KEY_ALREADY_GENERATED, publicKey: publicKey })
        return
      } catch (error) {
        // go ahead
      }

      // check if all shares are available
      const requiredKeyShares: number = requiredAuthorities
      let submittedKeyShares: number = 0
      try {
        submittedKeyShares = await BallotManager.getNrOfPublicKeyShares()
      } catch (error) {
        res.status(500).json({ msg: error.message })
        return
      }
      if (submittedKeyShares !== requiredKeyShares) {
        res.status(400).json({
          msg: KEYSHARE_GENERATION_ONGOING,
          submittedKeyShares: submittedKeyShares,
          requiredKeyShares: requiredKeyShares,
        })
        return
      }

      // create public key via ballot contract
      try {
        await BallotManager.generatePublicKey()
        publicKey = await BallotManager.getPublicKey()
      } catch (error) {
        res.status(400).json({ msg: error.message })
        return
      }

      res.status(201).json({ msg: SUCCESSFUL, publicKey: publicKey })
      return
    case VotingState.VOTING:
      res.status(400).json({ msg: TOO_LATE_MSG })
      return
    case VotingState.TALLY:
      res.status(400).json({ msg: TOO_LATE_MSG })
      return
  }
})

export default router
