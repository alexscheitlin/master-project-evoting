import express from 'express'

import { RPC } from '../utils'
import { getWeb3 } from '../utils/web3'

const router: express.Router = express.Router()

const PEER_SUCCESS_MSG: string = 'Successfully peered with network'
const PEER_FAIL_MSG: string = 'Could not connect to the network'

router.post('/peer', async (req, res) => {
  try {
    const enode = await RPC.getEnodeAtPort(process.env.SEALER_NODE_URL as string)
    await RPC.registerEnodeWithAuthority(enode)
    res.status(200).json({ msg: PEER_SUCCESS_MSG })
  } catch (error) {
    res.status(400).json({ msg: PEER_FAIL_MSG })
  }
})

router.get('/peer', async (req, res) => {
  try {
    const web3 = getWeb3()
    const connectedAuthorities = await web3.eth.net.getPeerCount()
    res.status(200).json({ msg: PEER_SUCCESS_MSG, nrOfPeers: connectedAuthorities })
  } catch (error) {
    res.status(400).json({ msg: PEER_FAIL_MSG })
  }
})

export default router
