import express from 'express'
import * as Deploy from '../../solidity/scripts/deploy'
import { getValueFromDB, setValue, BALLOT_DEPLOYED_TABLE, BALLOT_ADDRESS_TABLE } from '../database/database'
import { BallotManager } from '../utils/ballotManager'
import { parityConfig } from '../config'
import { getWeb3 } from '../utils/web3'

const BALLOT_DEPLOYED_SUCCESS_MESSAGE: string = 'Ballot successfully deployed. System parameters successfully set.'
const BALLOT_ALREADY_DEPLOYED_MESSAGE: string = 'Ballot already deployed.'
const VOTE_QUESTION_INVALID: string = 'Vote Question was not provided or is not of type String.'
const NOT_ALL_SEALERS_CONNECTED: string = 'Not all sealers are connected. Please wait!'

const web3 = getWeb3()
const router: express.Router = express.Router()

router.post('/deploy', async (req, res) => {
  // check if the contracts are already deployed
  const isDeployed: boolean = <boolean>getValueFromDB(BALLOT_DEPLOYED_TABLE)
  if (isDeployed) {
    const address: boolean = <boolean>getValueFromDB(BALLOT_ADDRESS_TABLE)
    res.status(201).json({ address: address, msg: BALLOT_ALREADY_DEPLOYED_MESSAGE })
    return
  }

  // verify that all sealers are connected
  const connectedAuthorities: number = await web3.eth.net.getPeerCount()
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes
  if (connectedAuthorities !== requiredAuthorities) {
    res.status(400).json({
      msg: NOT_ALL_SEALERS_CONNECTED,
      connectedSealers: connectedAuthorities,
      requiredSealers: requiredAuthorities,
    })
    return
  }

  const voteQuestion: string = <string>req.body.question
  const questionIsInvalid: boolean = validateVoteQuestion(voteQuestion)

  if (questionIsInvalid) {
    res.status(400).json({ msg: VOTE_QUESTION_INVALID })
  } else {
    Deploy.init(voteQuestion, parityConfig.numberOfAuthorityNodes)
      .then(address => {
        setValue(BALLOT_ADDRESS_TABLE, address)
        setValue(BALLOT_DEPLOYED_TABLE, true)

        // initialize the parameters of the system
        BallotManager.setSystemParameters()

        res.status(201).json({ address: address, msg: BALLOT_DEPLOYED_SUCCESS_MESSAGE })
      })
      .catch((err: Error) => {
        // TODO: Think of a better error status code -> the request was valid but some processing on the blockchain failed and, therefore, it is a server error and not a client side error -> better way to handle this.
        res.status(500).json({ msg: err })
      })
  }
})

router.get('/deploy', (req, res) => {
  const isDeployed: boolean = <boolean>getValueFromDB(BALLOT_DEPLOYED_TABLE)

  if (isDeployed) {
    const address: boolean = <boolean>getValueFromDB(BALLOT_ADDRESS_TABLE)
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
