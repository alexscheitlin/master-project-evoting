import express from 'express'
import { setValue, getValueFromDB } from '../database/database'

const STATE_INVALID: string = 'Provided state is invalid -> valid states are: PRE_VOTING, VOTING, POST_VOTING'

// database tables
const VOTING_STATE: string = 'state'

const router: express.Router = express.Router()

router.post('/state', (req, res) => {
  const currentState: string = <string>getValueFromDB(VOTING_STATE)

  const newState: string = req.body.state
  const isValidState: boolean = checkIfStateIsValid(newState)

  if (!isValidState) {
    res.status(400).json({ state: currentState, msg: STATE_INVALID })
  } else {
    setValue(VOTING_STATE, newState)
    res.status(201).json({ state: newState, msg: `New State: ${newState}` })
  }
})

export const checkIfStateIsValid = (state: string): boolean => {
  const validStates: string[] = ['PRE_VOTING', 'VOTING', 'POST_VOTING']

  if (state === null || typeof state === undefined || !validStates.includes(state)) {
    return false
  }
  return true
}

export default router
