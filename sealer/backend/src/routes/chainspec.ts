import express from 'express'

import { AuthBackend } from '../services'

const router: express.Router = express.Router()

const SUCESS_MSG: string = 'Chainspec successfully fetched and written to file!'
const SUCESS_FAIL: string = 'Chainspec could not be fetched! It might not be ready yet.'

router.get('/chainspec', async (req, res) => {
  try {
    await AuthBackend.fetchAndStoreChainspec()
    res.status(200).json({ msg: SUCESS_MSG })
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: SUCESS_FAIL })
  }
})

export default router
