import express from 'express'
import { addToList, getValueFromDB, STATE_TABLE, NODES_TABLE } from '../database/database'
import { VotingState } from './state'

const TOO_EARLY_MSG: string = 'You are too early to connect. Please wait for the STARTUP stage.'
const ON_TIME_MSG: string = "Let's connect and spin up that network!."
const TOO_LATE_MSG: string = 'You are too late to connect. You should have done that during the STARTUP stage.'

const URL_WRONG_FORMAT: string = 'The provided URL has the wrong format!'
const URL_ALREADY_STORED: string = 'The provided URL is already stored!'

const router: express.Router = express.Router()

router.post('/connectionNode', async (req, res) => {
  const url: string = req.body.url
  const currentState: string = <string>getValueFromDB(STATE_TABLE)
  const nodes: string[] = getValueFromDB(NODES_TABLE)

  let msg: string = ''
  switch (currentState) {
    case VotingState.REGISTER:
      res.status(400).json({ msg: TOO_EARLY_MSG })
      return
    case VotingState.STARTUP:
      // check the url format
      // http://abcdef:1234
      if (!url.match(/^http:\/\/.*:\d{4}$/)) {
        res.status(400).json({ msg: URL_WRONG_FORMAT, yourUrl: url })
        return
      }

      // only add the url if it is not already stored
      if (nodes.includes(url)) {
        res.status(200).json({ msg: URL_ALREADY_STORED, yourUrl: url, connectTo: nodes[0] })
        return
      } else {
        addToList(NODES_TABLE, [url])
        res.status(201).json({ msg: ON_TIME_MSG, yourUrl: url, connectTo: nodes[0] })
        return
      }
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
  res.status(200).json({ msg: msg, yourUrl: url, connectTo: nodes[0] })
})

export default router
