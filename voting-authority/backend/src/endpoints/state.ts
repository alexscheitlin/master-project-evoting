import BN from 'bn.js'
import express from 'express'

import { parityConfig } from '../config'
import {
  AUTHORITIES_TABLE,
  BALLOT_DEPLOYED_TABLE,
  getValueFromDB,
  NODES_TABLE,
  setValue,
  STATE_TABLE,
  VOTING_QUESTION_TABLE,
} from '../database/database'
import { BallotManager } from '../utils/ballotManager'
import { getNumberOfConnectedAuthorities } from '../utils/web3'

export enum VotingState {
  REGISTER = 'REGISTER',
  STARTUP = 'STARTUP',
  CONFIG = 'CONFIG',
  VOTING = 'VOTING',
  TALLY = 'TALLY',
  RESULT = 'RESULT',
}

const router: express.Router = express.Router()

// ----------------------------------------------------------------------------------------------------
// GET /state
// ----------------------------------------------------------------------------------------------------
router.get('/state', async (req, res) => {
  const currentState: string = <string>getValueFromDB(STATE_TABLE)
  const votingQuestion: string = getValueFromDB(VOTING_QUESTION_TABLE)
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes

  // report current state along with information about ...
  switch (currentState) {
    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------
    // ... how many sealers are required and already registered
    case VotingState.REGISTER:
      const registeredAuthorities: string[] = <string[]>getValueFromDB(AUTHORITIES_TABLE)
      res.status(200).json({
        state: currentState,
        registeredSealers: registeredAuthorities.length,
        requiredSealers: requiredAuthorities,
      })
      break

    // --------------------------------------------------
    // STARTUP
    // --------------------------------------------------
    // ... how many sealers are required and already connected
    case VotingState.STARTUP:
      let connectedAuthorities: number = 0
      let signedUpSealers: number = 0
      try {
        // check the number of ethereum network peers
        connectedAuthorities = await getNumberOfConnectedAuthorities()

        // check the number of signed up sealers
        const nodes: string[] = getValueFromDB(NODES_TABLE)
        signedUpSealers = nodes.length
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }
      res.status(200).json({
        state: currentState,
        connectedSealers: connectedAuthorities,
        signedUpSealers: signedUpSealers,
        requiredSealers: requiredAuthorities,
        question: votingQuestion,
      })
      break

    // --------------------------------------------------
    // CONFIG
    // --------------------------------------------------
    // ... how many public key shares are required and already submitted
    case VotingState.CONFIG:
      let submittedKeyShares: number = 0
      try {
        submittedKeyShares = await BallotManager.getNrOfPublicKeyShares()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      // get public key
      let publicKey: BN
      try {
        publicKey = await BallotManager.getPublicKey()
      } catch (error) {}

      const requiredKeyShares: number = requiredAuthorities
      res.status(200).json({
        state: currentState,
        submittedKeyShares: submittedKeyShares,
        requiredKeyShares: requiredKeyShares,
        publicKey: publicKey ? publicKey : -1,
      })
      break

    // --------------------------------------------------
    // VOTING
    // --------------------------------------------------
    // ... what the voting question is and ...
    // ... how many votes have been casted
    case VotingState.VOTING:
      let numberOfVotes: number = 0
      try {
        numberOfVotes = await BallotManager.getNumberOfVotes()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      res.status(200).json({
        state: currentState,
        question: votingQuestion,
        votesSubmitted: numberOfVotes,
      })
      break

    // --------------------------------------------------
    // TALLY
    // --------------------------------------------------
    // ... how many decrypted shares are required and have been submitted
    case VotingState.TALLY:
      let submittedDecryptedShares: number = 0
      const requiredDecryptedShares: number = requiredAuthorities
      try {
        submittedDecryptedShares = await BallotManager.getNumberOfDecryptedShares()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      res.status(200).json({
        state: currentState,
        submittedDecryptedShares: submittedDecryptedShares,
        requiredDecryptedShares: requiredDecryptedShares,
      })
      break

    // --------------------------------------------------
    // RESULT
    // --------------------------------------------------
    // ... how many yes/no votes have been recorded
    case VotingState.RESULT:
      let totalVotes: number = 0
      try {
        totalVotes = await BallotManager.getNumberOfVotes()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      let yesVotes: number = 0
      try {
        yesVotes = await BallotManager.getVoteResult()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      res.status(200).json({
        state: currentState,
        // TODO: can we handle this more elegantly?
        yesVotes: parseInt(yesVotes.toString()),
        noVotes: totalVotes - yesVotes,
        votingQuestion: getValueFromDB(VOTING_QUESTION_TABLE),
      })
      break

    default:
      res.status(200).json({ state: currentState })
  }
})

// ----------------------------------------------------------------------------------------------------
// POST /state
// ----------------------------------------------------------------------------------------------------
router.post('/state', async (req, res) => {
  const currentState: string = <string>getValueFromDB(STATE_TABLE)
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes

  switch (currentState) {
    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------
    case VotingState.REGISTER:
      // verify that all sealers are registered
      const registeredAuthorities: string[] = <string[]>getValueFromDB(AUTHORITIES_TABLE)
      if (registeredAuthorities.length !== requiredAuthorities) {
        res.status(400).json({
          state: currentState,
          msg: `There are only ${registeredAuthorities.length} sealers registered. ${requiredAuthorities} are needed for the next stage.`,
        })
        return
      }

      setValue(STATE_TABLE, VotingState.STARTUP)
      break

    // --------------------------------------------------
    // STARTUP
    // --------------------------------------------------
    case VotingState.STARTUP:
      // verify that all sealers are connected
      let connectedAuthorities: number = 0
      try {
        connectedAuthorities = await getNumberOfConnectedAuthorities()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      if (connectedAuthorities !== requiredAuthorities) {
        res.status(400).json({
          state: currentState,
          msg: `There are only ${connectedAuthorities} sealers connected. ${requiredAuthorities} are needed for the next stage.`,
        })
        return
      }

      // verify that the contracts are deployed
      const isDeployed: boolean = <boolean>getValueFromDB(BALLOT_DEPLOYED_TABLE)
      if (!isDeployed) {
        res.status(400).json({
          state: currentState,
          msg: `The ballot contract is not deployed yet. Please create a voting question and deploy all contracts!`,
        })
        return
      }

      setValue(STATE_TABLE, VotingState.CONFIG)
      break

    // --------------------------------------------------
    // CONFIG
    // --------------------------------------------------
    case VotingState.CONFIG:
      // check that all public key shares are submitted
      const requiredKeyShares: number = requiredAuthorities
      let submittedKeyShares: number = 0
      try {
        submittedKeyShares = await BallotManager.getNrOfPublicKeyShares()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }
      if (submittedKeyShares !== requiredKeyShares) {
        res.status(400).json({
          state: currentState,
          msg: `There are only ${submittedKeyShares} public key shares submitted, but ${requiredKeyShares} are needed.`,
        })
        return
      }

      // check that the public key is generated
      try {
        await BallotManager.getPublicKey()
      } catch (error) {
        res.status(400).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      // open voting via ballot contract
      try {
        await BallotManager.openBallot()
        await BallotManager.isBallotOpen()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      setValue(STATE_TABLE, VotingState.VOTING)
      break

    // --------------------------------------------------
    // VOTING
    // --------------------------------------------------
    case VotingState.VOTING:
      try {
        await BallotManager.closeBallot()
        await BallotManager.isBallotOpen()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      setValue(STATE_TABLE, VotingState.TALLY)
      break

    // --------------------------------------------------
    // TALLY
    // --------------------------------------------------
    case VotingState.TALLY:
      // check that all decrypted shares are submitted
      const requiredDecryptedShares: number = requiredAuthorities
      let submittedDecryptedShares: number = 0
      try {
        submittedDecryptedShares = await BallotManager.getNumberOfDecryptedShares()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }
      if (submittedDecryptedShares !== requiredDecryptedShares) {
        res.status(400).json({
          state: currentState,
          msg: `There are only ${submittedDecryptedShares} decrypted shares submitted, but ${requiredDecryptedShares} are needed.`,
        })
        return
      }

      // combine decrypted shares
      try {
        await BallotManager.combineDecryptedShares()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      // check that the voting result is available
      try {
        await BallotManager.getVoteResult()
      } catch (error) {
        res.status(500).json({
          state: currentState,
          msg: error.message,
        })
        return
      }

      setValue(STATE_TABLE, VotingState.RESULT)
      break

    default:
      res.status(400).json({ state: currentState, msg: `There is nothing to change!` })
      return
  }

  const newState: string = getValueFromDB(STATE_TABLE)
  res.status(201).json({
    state: newState,
    msg: `Changed from '${currentState}' to '${newState}'`,
  })
})

export default router
