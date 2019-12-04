import express from 'express'

import { runScript } from '../utils/shell'

const router: express.Router = express.Router()

// messages
const CONTAINER_STARTED: string = 'Container successfully started!'

router.get('/startContainer', async (req, res) => {
  const { stdout, stderr } = await runScript('src/scripts/test.sh')
  console.log(stdout)

  res.status(200).json({ msg: CONTAINER_STARTED })
})

export default router
