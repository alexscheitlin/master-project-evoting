import express from 'express'

import { AuthBackend, ChainService, RPC } from '../services'
import { urlUtil } from '../utils'

const router: express.Router = express.Router()

const PEER_SUCCESS_MSG: string = 'Successfully peered with network'
const PEER_BOOTNODE_MSG: string = 'Successfully contacted authority. You are the bootnode. Please wait for other peers to connect to you.'
const PEER_FAIL_MSG: string = 'Could not connect to the network'

router.post('/peer', async (req, res) => {
  try {
    const myUrl = urlUtil.getParityUrl()

    const bootNodeUrl = await AuthBackend.getBootNodeUrl(myUrl)

    let iAmBootNode = bootNodeUrl === myUrl

    if (!iAmBootNode) {
      const enode = await RPC.getEnodeAtPort(process.env.SEALER_NODE_PORT as string)
      await RPC.registerEnodeWithAuthority(enode, bootNodeUrl)
      res.status(200).json({ msg: PEER_SUCCESS_MSG })
      return
    }
    res.status(200).json({ msg: PEER_BOOTNODE_MSG })
  } catch (error) {
    if (error.response.status === 400) {
      res.status(200).json({ msg: error.response.data.msg })
      return
    }
    res.status(400).json({ msg: PEER_FAIL_MSG })
  }
})

router.get('/peer', async (req, res) => {
  try {
    const connectedAuthorities = await ChainService.getPeerCount()
    res.status(200).json({ msg: PEER_SUCCESS_MSG, nrOfPeers: connectedAuthorities })
  } catch (error) {
    res.status(400).json({ msg: PEER_FAIL_MSG })
  }
})

export default router
