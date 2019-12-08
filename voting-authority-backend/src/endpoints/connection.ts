import express from 'express'
import { getValueFromDB, STATE_TABLE } from '../database/database'
import { parityConfig } from '../config'
import { VotingState } from './state'

const TOO_EARLY_MSG: string = 'You are too early to connect. Please wait for the STARTUP stage.'
const ON_TIME_MSG: string = "Let's connect and spin up that network!."
const TOO_LATE_MSG: string = 'You are too late to connect. You should have done that during the STARTUP stage.'

const router: express.Router = express.Router()

router.get('/connectionNode', async (req, res) => {
  const nodeUrl: string = parityConfig.connectionNodeUrl
  const currentState: string = <string>getValueFromDB(STATE_TABLE)

  let msg: string = ''
  switch (currentState) {
    case VotingState.REGISTER:
      msg = TOO_EARLY_MSG
      break
    case VotingState.STARTUP:
      msg = ON_TIME_MSG
      break

    case VotingState.CONFIG:
      msg = TOO_LATE_MSG
      break
    case VotingState.VOTING:
      msg = TOO_LATE_MSG
      break
    case VotingState.TALLY:
      msg = TOO_LATE_MSG
      break
  }
  res.status(200).json({ msg: msg, nodeUrl: nodeUrl })
})

export default router
