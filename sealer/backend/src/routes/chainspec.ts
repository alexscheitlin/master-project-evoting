import axios from 'axios'
import express from 'express'
import fs from 'fs'

import { config } from '../config'

const router: express.Router = express.Router()
// messages
const SUCESS_MSG: string = 'Chainspec successfully fetched and written to file!'
const SUCESS_FAIL: string = 'Chainspec could not be fetched! It might not be ready yet.'

router.get('/chainspec', async (req, res) => {
  // fetch chainspec from auth backend
  try {
    const result = await axios.get(config.authBackend.devUrl + '/chainspec')
    const chainspec = JSON.stringify(result.data)
    fs.writeFileSync('src/chainspec/chain.json', chainspec)

    res.status(200).json({ msg: SUCESS_MSG })
  } catch (error) {
    res.status(400).json({ msg: SUCESS_FAIL })
  }
})

export default router
