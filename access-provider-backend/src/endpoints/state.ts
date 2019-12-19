import axios from 'axios'
import express from 'express'

import { serverConfig } from '../config'
import { VotingState } from '../models/state'

const router: express.Router = express.Router()

router.get('/state', async (req, res) => {
  let state: VotingState
  // get current state from auth
  try {
    const response = await axios.get(`${serverConfig.authUrl}/state`)
    state = response.data.state
  } catch (error) {
    throw new Error('Could not fetch state from authority.')
  }

  // get ballot contract address from auth
  try {
    const response = await axios.get(`${serverConfig.authUrl}/deploy`)
    res.status(200).json({ state: state, address: response.data.address })
    return
  } catch (error) {
    throw new Error('Could not fetch address from authority.')
  }
})

export default router
