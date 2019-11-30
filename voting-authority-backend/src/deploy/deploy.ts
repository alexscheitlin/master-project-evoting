import express from 'express'
import { setValue, getValueFromDB } from '../database/database'
import * as Deploy from '../../solidity/scripts/deploy'

const BALLOT_DEPLOYED_SUCCESS_MESSAGE: string = 'Ballot successfully deployed.'
const BALLOT_ALREADY_DEPLOYED_MESSAGE: string = 'Ballot already deployed.'
const BALLOT_NOT_MESSAGE: string = 'Ballot is not yet deployed.'

const DEPLOYMENT_ADDRESS: string = 'ballotAddress'
const DEPLOYMENT_STATE: string = 'ballotDeployed'

const router: express.Router = express.Router()

router.post('/deploy', (req, res) => {
  const isDeployed: string = getValueFromDB(DEPLOYMENT_STATE)

  if (isDeployed === 'true') {
    const address: string = getValueFromDB(DEPLOYMENT_ADDRESS)
    res.status(201).json({ address: address, msg: BALLOT_ALREADY_DEPLOYED_MESSAGE })
  }

  if (isDeployed === 'false') {
    Deploy.init()
      .then(addr => {
        setValue(DEPLOYMENT_ADDRESS, addr)
        setValue(DEPLOYMENT_STATE, 'true')
        res.status(201).json({ address: addr, msg: BALLOT_DEPLOYED_SUCCESS_MESSAGE })
      })
      .catch(err => {
        res.status(400).json({ msg: err })
      })
  }
})

router.get('/deploy', (req, res) => {
  const isDeployed: string = getValueFromDB(DEPLOYMENT_STATE)

  if (isDeployed === 'true') {
    const address: string = getValueFromDB(DEPLOYMENT_ADDRESS)
    res.status(200).json({ address: address })
  } else {
    res.status(400).json({ msg: BALLOT_NOT_MESSAGE })
  }
})

export default router
