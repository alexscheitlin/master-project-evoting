import express from 'express'
import { DockerManager } from '../utils/docker'

const router: express.Router = express.Router()

// messages
const BOOT_MSG: string = 'Sealer Node successfully started!'

router.post('/boot', (req, res) => {
  // get final chainspec from auth backend

  res.status(200).json({ msg: BOOT_MSG })
})

export default router
