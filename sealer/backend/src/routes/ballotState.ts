import express from 'express'

import { AuthBackend, BallotManager } from '../services'
import { VotingState } from '../models/states'

const router: express.Router = express.Router()

router.get('/ballotState', async (req, res) => {
  try {
    const state = await BallotManager.getBallotState()
    if (state === VotingState.RESULT) {
      const nrYesVotes = await BallotManager.getVoteResult()
      const totalVotes = await BallotManager.getNumberOfVotes()
      const votingQuestion = await BallotManager.getVotingQuestion()
      res
        .status(200)
        .json({ state: state, yesVotes: nrYesVotes, totalVotes: totalVotes, votingQuestion: votingQuestion })
      return
    }
    res.status(200).json({ state: state })
  } catch (error) {
    console.log(error)
    res.status(400).json({ state: null, msg: error.message })
  }
})

export default router
