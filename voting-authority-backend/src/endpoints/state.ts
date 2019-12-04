import express from 'express'
import { setValue, getValueFromDB } from '../database/database'
import { BallotManager } from '../utils/ballotManager/index'

export enum VotingState {
  PRE_VOTING = 'PRE_VOTING',
  VOTING = 'VOTING',
  POST_VOTING = 'POST_VOTING',
}

const STATE_INVALID: string = 'Provided state is invalid -> valid states are: PRE_VOTING, VOTING, POST_VOTING'

// database tables
const VOTING_STATE: string = 'state'

const router: express.Router = express.Router()

// TODO: create get request for state

// TODO: create more states, the new states are: REGISTER, STARTUP, PREVOTING, VOTING, POSTVOTING

// TODO: adjust POST request for changing to NEXT state, empty request body

router.post('/state', async (req, res) => {
  const currentState: string = <string>getValueFromDB(VOTING_STATE)

  const newState: string = req.body.state
  const isValidState: boolean = checkIfStateIsValid(newState)

  if (!isValidState) {
    res.status(400).json({ state: currentState, msg: STATE_INVALID })
  } else {
    setValue(VOTING_STATE, newState)

    if (newState === VotingState.VOTING) {
      await BallotManager.openBallot()
    } else if (newState === VotingState.POST_VOTING) {
      await BallotManager.closeBallot()
    }

    res.status(201).json({ state: newState, msg: `New State: ${newState}` })
  }
})

export const checkIfStateIsValid = (state: string): boolean => {
  const validStates: string[] = [VotingState.PRE_VOTING, VotingState.VOTING, VotingState.POST_VOTING]

  if (state === null || typeof state === undefined || !validStates.includes(state)) {
    return false
  }
  return true
}

export default router
