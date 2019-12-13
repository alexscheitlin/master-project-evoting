import express from 'express'

import { AuthBackend } from '../services'

const router: express.Router = express.Router()

router.get('/state', async (req, res) => {
  try {
    const state: string = await AuthBackend.fetchState()
    res.status(200).json({ state: state })
  } catch (error) {
    console.log(error)
    res.status(400).json({ state: null, msg: error.message })
  }
})

export default router
