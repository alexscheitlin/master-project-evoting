import express from 'express'
import * as Deploy from '../../solidity/scripts/deploy'
import { getValueFromDB, setValue } from '../database/database'

const BALLOT_DEPLOYED_SUCCESS_MESSAGE: string = 'Ballot successfully deployed.'
const BALLOT_ALREADY_DEPLOYED_MESSAGE: string = 'Ballot already deployed.'
const VOTE_QUESTION_INVALID: string = 'Vote Question was not provided or is not of type String.'

const DEPLOYMENT_ADDRESS: string = 'ballotAddress'
const DEPLOYMENT_STATE: string = 'ballotDeployed'

const router: express.Router = express.Router()

router.post('/deploy', (req, res) => {
  const isDeployed: boolean = <boolean>getValueFromDB(DEPLOYMENT_STATE)

  if (isDeployed) {
    const address: boolean = <boolean>getValueFromDB(DEPLOYMENT_ADDRESS)
    res.status(201).json({ address: address, msg: BALLOT_ALREADY_DEPLOYED_MESSAGE })
    return
  }

  const voteQuestion: string = <string>req.body.question
  const questionIsInvalid: boolean = validateVoteQuestion(voteQuestion)

  if (questionIsInvalid) {
    res.status(400).json({ msg: VOTE_QUESTION_INVALID })
  } else {
    Deploy.init(voteQuestion)
      .then(addr => {
        setValue(DEPLOYMENT_ADDRESS, addr)
        setValue(DEPLOYMENT_STATE, true)
        res.status(201).json({ address: addr, msg: BALLOT_DEPLOYED_SUCCESS_MESSAGE })
      })
      .catch((err: Error) => {
        // TODO: Think of a better error status code -> the request was valid but some processing on the blockchain failed and, therefore, it is a server error and not a client side error -> better way to handle this.
        res.status(500).json({ msg: err })
      })
  }
})

router.get('/deploy', (req, res) => {
  const isDeployed: boolean = <boolean>getValueFromDB(DEPLOYMENT_STATE)

  if (isDeployed) {
    const address: boolean = <boolean>getValueFromDB(DEPLOYMENT_ADDRESS)
    res.status(200).json({ address: address, msg: BALLOT_ALREADY_DEPLOYED_MESSAGE })
  } else {
    // reason why we don't return anything at all -> if the contract has not been deployed yet, there is nothing there so there will be nothing returned. Nevertheless, the request and the processing was successful.
    res.sendStatus(204)
  }
})

export const validateVoteQuestion = (question: string) => {
  if (question === null || typeof question !== 'string') {
    return true
  }
  return false
}

export default router
