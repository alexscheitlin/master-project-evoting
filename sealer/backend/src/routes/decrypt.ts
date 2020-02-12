import express from 'express'
import { getValueFromDB, PRIVATE_KEY_SHARE_TABLE } from '../database/database'
import { VotingState } from '../models/states'
import { BallotManager } from '../services'
import BN = require('bn.js')
import { FFelGamal } from '@meck93/evote-crypto'

const router: express.Router = express.Router()

router.post('/decrypt', async (req: express.Request, res: express.Response) => {
  try {
    // fetch state directly from contract instead of vote-auth backend
    let state: VotingState = await BallotManager.getBallotState()
    state = VotingState.TALLYING

    switch (state) {
      case VotingState.TALLYING: {
        const votesAsStrings = await BallotManager.getAllVotes()
        const votes: FFelGamal.Cipher[] = votesAsStrings.map(
          vote => ({ a: new BN(vote.a), b: new BN(vote.b) } as FFelGamal.Cipher)
        )

        const systemParamsString: number[] = await BallotManager.getSystemParameters()
        const systemParams: FFelGamal.SystemParameters = {
          p: new BN(systemParamsString[0]),
          q: new BN(systemParamsString[1]),
          g: new BN(systemParamsString[2]),
        }

        const sum = BallotManager.homomorphicallyAddVotes(votes, systemParams)

        // read private key share from DB and convert back to BN
        const privateKeyShareString: string = getValueFromDB(PRIVATE_KEY_SHARE_TABLE)
        const privateKeyShare: BN = new BN(privateKeyShareString, 'hex')

        const decryptedShare = BallotManager.decryptShare(sum, systemParams, privateKeyShare)

        const proof = BallotManager.generateDecryptionProof(sum, systemParams, privateKeyShare)

        const result = await BallotManager.submitDecryptedShare(sum, decryptedShare, proof)

        res.status(201).json({ decryptedShareSubmitted: result['0'], msg: result['1'] })
        break
      }
      default:
        res
          .status(400)
          .json({ msg: `A decrypted share of the cast votes can only be submitted in the Tallying stage!` })
        break
    }
  } catch (error) {
    res.status(500).json({ msg: error.msg })
  }
})

export default router
