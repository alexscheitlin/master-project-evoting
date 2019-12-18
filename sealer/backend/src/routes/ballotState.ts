import express from 'express'

import { AuthBackend, BallotManager } from '../services'

const router: express.Router = express.Router()

router.get('/ballotState', async (req, res) => {
  try {
    const state = await BallotManager.getBallotState()
    res.status(200).json({ state: state })
  } catch (error) {
    console.log(error)
    res.status(400).json({ state: null, msg: error.message })
  }
})

export default router
