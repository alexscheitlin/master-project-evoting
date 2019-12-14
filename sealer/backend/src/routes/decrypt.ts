import express from 'express'

import { AuthBackend } from '../services'
import { VotingState } from '../models/states'

const router: express.Router = express.Router()

router.post('/decrypt', async (req: express.Req, res: express.Res) => {
  try {
    // TODO: fetch state directly from contract instead of vote-auth backend
    const state: VotingState = await AuthBackend.fetchState()

    switch (state) {
      // TODO: add handling for other cases
      case VotingState.TALLY:
        res.status(201).json({})
        break
      default:
        // TODO: improve message
        res.status(400).json({ msg: `Invalid request!` })
        break
    }
  } catch (error) {
    console.log(error)
    // TODO: think of good error message
    res.status(500).json({})
  }
})

export default router
