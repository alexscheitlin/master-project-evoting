import express from 'express'
import { getValueFromDB, PRIVATE_KEY_SHARE_TABLE } from '../database/database'
import { VotingState } from '../models/states'
import { AuthBackend, BallotManager } from '../services'
import BN = require('bn.js')
import { FFelGamal } from '@meck93/evote-crypto'

const router: express.Router = express.Router()

router.post('/decrypt', async (req: express.Request, res: express.Response) => {
  try {
    // TODO: fetch state directly from contract instead of vote-auth backend
    let state: VotingState = await AuthBackend.fetchState()
    console.log(state)
    state = VotingState.TALLY

    // TODO: add handling for other cases
    switch (state) {
      case VotingState.TALLY: {
        // TODO: check if decrypted share for this authority has already been submitted

        const votesAsStrings = await BallotManager.getAllVotes()
        const votes: FFelGamal.Cipher[] = votesAsStrings.map(
          vote => ({ a: new BN(vote.a), b: new BN(vote.b) } as FFelGamal.Cipher)
        )

        // TODO: maybe this can be fetched from somewhere else or done more intelligently
        const systemParamsString: string[] = await BallotManager.getSystemParameters()
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
        // TODO: improve message
        res.status(400).json({ msg: `Invalid request!` })
        break
    }
  } catch (error) {
    console.log(error)
    // TODO: think of good error message
    res.status(500).json({ msg: error.msg })
  }
})

export default router
