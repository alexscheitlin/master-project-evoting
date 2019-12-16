import express from 'express'

import { AuthBackend } from '../services'

const router: express.Router = express.Router()

router.get('/deploy', async (req, res) => {
  try {
    const response = await AuthBackend.getBallotAddress()
    // TODO: fix this, does not work somehow
    // make sure to get the right boolean
    if (response === '') {
      res.status(200).json({ deployed: false })
      return
    } else {
      res.status(200).json({ deployed: true })
      return
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({ state: null, msg: error.message })
  }
})

export default router
