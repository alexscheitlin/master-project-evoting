import express from 'express'
import { setValue, getValueFromDB } from '../database/database'
import { BallotManager } from '../utils/ballotManager/index'
import { parityConfig } from '../config'
import { getWeb3 } from '../utils/web3'

const web3 = getWeb3()

export enum VotingState {
  REGISTER = 'REGISTER',
  STARTUP = 'STARTUP',
  CONFIG = 'CONFIG',
  VOTING = 'VOTING',
  TALLY = 'TALLY',
}

// database tables
const VOTING_STATE: string = 'state'
const AUTHORITIES: string = 'authorities'

const router: express.Router = express.Router()

router.get('/state', async (req, res) => {
  const currentState: string = <string>getValueFromDB(VOTING_STATE)
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes

  switch (currentState) {
    case VotingState.REGISTER:
      const registeredAuthorities: string[] = <string[]>getValueFromDB(AUTHORITIES)

      res.status(201).json({
        state: currentState,
        registeredSealers: registeredAuthorities.length,
        requiredSealers: requiredAuthorities,
      })
      break

    case VotingState.STARTUP:
      const connectedAuthorities: number = await web3.eth.net.getPeerCount()

      res.status(201).json({
        state: currentState,
        connectedSealers: connectedAuthorities,
        requiredSealers: requiredAuthorities,
      })
      break

    default:
      res.status(201).json({ state: currentState })
  }
})

router.post('/state', async (req, res) => {
  const currentState: string = <string>getValueFromDB(VOTING_STATE)
  const requiredAuthorities: number = parityConfig.numberOfAuthorityNodes

  let status = false
  switch (currentState) {
    case VotingState.REGISTER:
      // verify that the all sealers are registered
      const registeredAuthorities: string[] = <string[]>getValueFromDB(AUTHORITIES)

      if (registeredAuthorities.length !== requiredAuthorities) {
        res.status(400).json({
          state: currentState,
          msg: `There are only ${registeredAuthorities.length} sealers registered. ${requiredAuthorities} are needed for the next stage.`,
        })
        return
      }

      setValue(VOTING_STATE, VotingState.STARTUP)
      break
    case VotingState.STARTUP:
      // verify that all sealers are connected
      const connectedAuthorities: number = await web3.eth.net.getPeerCount()

      if (connectedAuthorities !== requiredAuthorities) {
        res.status(400).json({
          state: currentState,
          msg: `There are only ${connectedAuthorities} sealers connected. ${requiredAuthorities} are needed for the next stage.`,
        })
        return
      }

      // TODO: verify that the contracts are deployed

      setValue(VOTING_STATE, VotingState.CONFIG)
      break
    case VotingState.CONFIG:
      // TODO: check that all public key shares are submitted
      // TODO: check that the public key is generated

      await BallotManager.openBallot()
      status = await BallotManager.isBallotOpen()

      setValue(VOTING_STATE, VotingState.VOTING)
      break
    case VotingState.VOTING:
      await BallotManager.closeBallot()
      status = await BallotManager.isBallotOpen()

      setValue(VOTING_STATE, VotingState.TALLY)
      break

    default:
      res.status(400).json({ state: currentState, msg: `There is nothing to change!` })
  }

  const newState: string = getValueFromDB(VOTING_STATE)
  res.status(201).json({ state: newState, msg: `Changed from '${currentState}' to '${newState}'`, isBallotOpen: `${status}` })
})

export default router
