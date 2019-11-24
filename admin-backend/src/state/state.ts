import express from 'express'
import { setValue } from '../database/database'

const STATE_INVALID: string = 'Provided state is invalid -> valid states are: VOTING or PRE_VOTING'

// database tables
const VOTING_STATE: string = 'state'

const router: express.Router = express.Router()

router.post('/state', (req, res) => {
  const newState: string = req.body.state
  const isValidState: boolean = checkIfStateIsValid(newState)

  if (!isValidState) {
    res.status(400).json({ updated: false, msg: STATE_INVALID })
  }

  setValue(VOTING_STATE, newState)
  res.status(200).json({ updated: true, msg: `State: ${newState}` })
})

export const checkIfStateIsValid = (state: string): boolean => {
  const validStates: string[] = ['VOTING', 'PRE_VOTING']

  if (state === null || typeof state === undefined || !validStates.includes(state)) {
    return false
  }
  return true
}

export default router
