import express from 'express'

import { AuthBackend, ChainService, RPC } from '../services'
import { urlUtil } from '../utils'

const router: express.Router = express.Router()

const PEER_SUCCESS_MSG: string = 'Successfully peered with network'
const PEER_BOOTNODE_MSG: string =
  'Successfully contacted authority. You are the bootnode. Please wait for other peers to connect to you.'
const PEER_FAIL_MSG: string = 'Seems like you are not connected to any peers. Try peering again.'

router.post('/peer', async (req, res) => {
  // get the URL of this node
  const myUrl = urlUtil.getParityUrl()

  let bootNodeUrl

  try {
    // get the suggested bootnode from the authority backend
    bootNodeUrl = await AuthBackend.getBootNodeUrl(myUrl)
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: 'Unable to contact the authority backend to get the bootnode.', bootnode: false })
    return
  }

  // check if I am the bootnode
  const iAmBootNode = bootNodeUrl === myUrl

  if (!iAmBootNode) {
    let enode
    try {
      // get this nodes enode on it's parity-node port
      enode = await RPC.getEnodeAtPort(process.env.PARITY_NODE_PORT as string)
    } catch (error) {
      console.log(error)
      res.status(400).json({ msg: `Unable to get the enode at port ${process.env.SEALER_NODE_PORT}.`, bootnode: false })
      return
    }

    try {
      // send the enode to the bootNode url
      await RPC.registerEnodeWithAuthority(enode, bootNodeUrl)
      res.status(201).json({ msg: PEER_SUCCESS_MSG, bootnode: false })
      return
    } catch (error) {
      res
        .status(400)
        .json({ msg: `Unable to send enode to bootnode on port ${process.env.SEALER_NODE_PORT}.`, bootnode: false })
      return
    }
  }
  res.status(201).json({ msg: PEER_BOOTNODE_MSG, bootnode: true })
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
