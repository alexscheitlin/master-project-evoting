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
  REGISTRATION = 'REGISTRATION',
  PAIRING = 'PAIRING',
  KEY_GENERATION = 'KEY_GENERATION',
  VOTING = 'VOTING',
  TALLYING = 'TALLYING',
  RESULT = 'RESULT',
}

const router: express.Router = express.Router()

// ----------------------------------------------------------------------------------------------------
// GET /state
// ----------------------------------------------------------------------------------------------------
router.get('/state', async (req, res) => {
  const currentState: string = getValueFromDB(STATE_TABLE) as string
  const votingQuestion: string = getValueFromDB(VOTING_QUESTION_TABLE)
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes

  // report current state along with information about ...
  switch (currentState) {
    // --------------------------------------------------
    // REGISTRATION
    // --------------------------------------------------
    // ... how many sealers are required and already registered
    case VotingState.REGISTRATION: {
      const registeredAuthorities: string[] = getValueFromDB(AUTHORITIES_TABLE) as string[]
      res.status(200).json({
        state: currentState,
        registeredSealers: registeredAuthorities.length,
        requiredSealers: requiredAuthorities,
      })
      break
    }

    // --------------------------------------------------
    // PAIRING
    // --------------------------------------------------
    // ... how many sealers are required and already connected
    case VotingState.PAIRING: {
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
    }

    // --------------------------------------------------
    // KEY_GENERATION
    // --------------------------------------------------
    // ... how many public key shares are required and already submitted
    case VotingState.KEY_GENERATION: {
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
      let publicKey: BN = new BN(0)
      try {
        publicKey = await BallotManager.getPublicKey()
        publicKey = new BN(publicKey)
      } catch (error) {
        // ignore
      }
      const requiredKeyShares: number = requiredAuthorities
      res.status(200).json({
        state: currentState,
        submittedKeyShares: submittedKeyShares,
        requiredKeyShares: requiredKeyShares,
        publicKey: publicKey.toNumber() > 0 ? publicKey.toNumber() : -1,
      })
      break
    }

    // --------------------------------------------------
    // VOTING
    // --------------------------------------------------
    // ... what the voting question is and ...
    // ... how many votes have been casted
    case VotingState.VOTING: {
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
    }

    // --------------------------------------------------
    // TALLYING
    // --------------------------------------------------
    // ... how many decrypted shares are required and have been submitted
    case VotingState.TALLYING: {
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
    }

    // --------------------------------------------------
    // RESULT
    // --------------------------------------------------
    // ... how many yes/no votes have been recorded
    case VotingState.RESULT: {
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
        yesVotes: parseInt(yesVotes.toString()),
        noVotes: totalVotes - yesVotes,
        votingQuestion: getValueFromDB(VOTING_QUESTION_TABLE),
      })
      break
    }

    default: {
      res.status(200).json({ state: currentState })
    }
  }
})

// ----------------------------------------------------------------------------------------------------
// POST /state
// ----------------------------------------------------------------------------------------------------
router.post('/state', async (req, res) => {
  const currentState: string = getValueFromDB(STATE_TABLE) as string
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes

  switch (currentState) {
    // --------------------------------------------------
    // REGISTRATION
    // --------------------------------------------------
    case VotingState.REGISTRATION: {
      // verify that all sealers are registered
      const registeredAuthorities: string[] = getValueFromDB(AUTHORITIES_TABLE) as string[]
      if (registeredAuthorities.length !== requiredAuthorities) {
        res.status(400).json({
          state: currentState,
          msg: `There are only ${registeredAuthorities.length} sealers registered. ${requiredAuthorities} are needed for the next stage.`,
        })
        return
      }

      setValue(STATE_TABLE, VotingState.PAIRING)
      break
    }

    // --------------------------------------------------
    // PAIRING
    // --------------------------------------------------
    case VotingState.PAIRING: {
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
      const isDeployed: boolean = getValueFromDB(BALLOT_DEPLOYED_TABLE) as boolean
      if (!isDeployed) {
        res.status(400).json({
          state: currentState,
          msg: `The ballot contract is not deployed yet. Please create a voting question and deploy all contracts!`,
        })
        return
      }

      setValue(STATE_TABLE, VotingState.KEY_GENERATION)
      break
    }

    // --------------------------------------------------
    // KEY_GENERATION
    // --------------------------------------------------
    case VotingState.KEY_GENERATION: {
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
    }

    // --------------------------------------------------
    // VOTING
    // --------------------------------------------------
    case VotingState.VOTING: {
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

      setValue(STATE_TABLE, VotingState.TALLYING)
      break
    }

    // --------------------------------------------------
    // TALLYING
    // --------------------------------------------------
    case VotingState.TALLYING: {
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
    }

    default: {
      res.status(400).json({ state: currentState, msg: `There is nothing to change!` })
      return
    }
  }

  const newState: string = getValueFromDB(STATE_TABLE)
  res.status(201).json({
    state: newState,
    msg: `Changed from '${currentState}' to '${newState}'`,
  })
})

export default router
