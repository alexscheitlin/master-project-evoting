import express from 'express'

import * as Deploy from '../../solidity/scripts/deploy'
import { parityConfig } from '../config'
import {
  BALLOT_ADDRESS_TABLE,
  BALLOT_DEPLOYED_TABLE,
  getValueFromDB,
  NODES_TABLE,
  setValue,
  STATE_TABLE,
  VOTING_QUESTION_TABLE,
} from '../database/database'
import { BallotManager } from '../utils/ballotManager'
import { createAccount } from '../utils/rpc'
import { getNumberOfConnectedAuthorities } from '../utils/web3'
import { VotingState } from './state'

const TOO_EARLY: string = 'We are in the REGISTER stage. Please wait with the deployment!'
const BALLOT_DEPLOYED_SUCCESS_MESSAGE: string = 'Ballot successfully deployed. System parameters successfully set.'
const BALLOT_ALREADY_DEPLOYED_MESSAGE: string = 'Ballot already deployed.'
const VOTE_QUESTION_INVALID: string = 'Vote Question was not provided or is not of type String.'
const NOT_ALL_SEALERS_CONNECTED: string = 'Not all sealers are connected. Please wait!'
const ACCOUNT_CREATION_FAILED: string = 'The wallet could not be created!'

const router: express.Router = express.Router()

router.post('/deploy', async (req, res) => {
  const currentState: string = <string>getValueFromDB(STATE_TABLE)
  if (currentState === VotingState.REGISTER) {
    res.status(400).json({ msg: TOO_EARLY })
    return
  }

  // check if the contracts are already deployed
  const isDeployed: boolean = <boolean>getValueFromDB(BALLOT_DEPLOYED_TABLE)
  if (isDeployed) {
    const address: boolean = <boolean>getValueFromDB(BALLOT_ADDRESS_TABLE)
    res.status(409).json({ address: address, msg: BALLOT_ALREADY_DEPLOYED_MESSAGE })
    return
  }

  // verify that all sealers are connected (i.e. that that the peer count is sufficient)
  let connectedAuthorities: number = 0
  try {
    connectedAuthorities = await getNumberOfConnectedAuthorities()
  } catch (error) {
    res.status(400).json({
      msg: 'Could not verify whether all sealers are connected or not!',
      error: 'web3: ' + error.message,
    })
    return
  }

  const nodes: string[] = getValueFromDB(NODES_TABLE)
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes
  if (connectedAuthorities !== requiredAuthorities) {
    // from chain
    res.status(400).json({
      msg: NOT_ALL_SEALERS_CONNECTED,
      connectedSealers: connectedAuthorities,
      requiredSealers: requiredAuthorities,
    })
    return
  }
  if (nodes.length !== requiredAuthorities) {
    // from db
    res.status(400).json({
      msg: NOT_ALL_SEALERS_CONNECTED,
      connectedSealers: nodes.length,
      requiredSealers: requiredAuthorities,
    })
    return
  }

  const voteQuestion: string = <string>req.body.question
  const questionIsInvalid: boolean = validateVoteQuestion(voteQuestion)
  if (questionIsInvalid) {
    res.status(400).json({ msg: VOTE_QUESTION_INVALID })
    return
  }

  // create voting auth account
  let accountAddress: string = ''
  try {
    accountAddress = await createAccount(parityConfig.nodeUrl, parityConfig.accountPassword, parityConfig.accountPassword)
  } catch (error) {
    res.status(400).json({ msg: ACCOUNT_CREATION_FAILED, error: error.message })
    return
  }

  if (accountAddress !== parityConfig.accountAddress) {
    res.status(400).json({
      msg: ACCOUNT_CREATION_FAILED,
      expectedAddress: parityConfig.accountAddress,
      createdAddress: accountAddress,
    })
    return
  }

  // deploy contracts
  Deploy.init(voteQuestion, parityConfig.numberOfAuthorityNodes)
    .then(address => {
      setValue(BALLOT_ADDRESS_TABLE, address)
      setValue(BALLOT_DEPLOYED_TABLE, true)
      setValue(VOTING_QUESTION_TABLE, voteQuestion)

      // initialize the parameters of the system
      BallotManager.setSystemParameters()
      res.status(201).json({ address: address, msg: BALLOT_DEPLOYED_SUCCESS_MESSAGE })
    })
    .catch((error: Error) => res.status(500).json({ msg: error.message }))
})

router.get('/deploy', (req, res) => {
  const isDeployed: boolean = <boolean>getValueFromDB(BALLOT_DEPLOYED_TABLE)

  if (isDeployed) {
    const address: boolean = <boolean>getValueFromDB(BALLOT_ADDRESS_TABLE)
    res.status(200).json({ address: address, msg: BALLOT_ALREADY_DEPLOYED_MESSAGE })
  } else {
    // reason why we don't return anything at all
    // if the contract has not been deployed yet, there is nothing there
    // so there will be nothing returned. Nevertheless, the request and the
    // processing was successful.
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
