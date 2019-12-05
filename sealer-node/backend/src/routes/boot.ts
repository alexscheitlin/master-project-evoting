import express from 'express'

const router: express.Router = express.Router()

// messages
const BOOT_MSG: string = 'Sealer Node successfully started!'

router.post('/boot', (req, res) => {
  // get chainspec (or an array of sealer nodes to add to own chain.json)

  // start parity docker container
  // - copy over files that are specific to this sealer-node (keys etc.)

  res.status(200).json({ msg: BOOT_MSG })
})

export default router
