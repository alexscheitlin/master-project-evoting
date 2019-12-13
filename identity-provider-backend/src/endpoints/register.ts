import express from 'express'
import crypto = require('crypto')
import { getListFromDB, addToList, IDENTITIES_TABLE, TOKENS_TABLE } from '../database/database'
import { Identity, IdentityToken } from '../models'

const axios = require('axios')
const router: express.Router = express.Router()

// http response messages
const NO_VOTERS: string = 'No voters specified!'
const INVALID_VOTER = (uuid: string) => `No uuid found for: ${uuid}`
const SUCCESS_MSG: string = 'Successfully registered voters!'

// check if there is an identity with the given uuid
export const isUuidValid = (identities: Identity[], uuid: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getListFromDB won't work any more
  return identities.map(i => i.uuid).includes(uuid)
}

export const areVotersValid = (identities: Identity[], voters: string[]): boolean | Error => {
  if (voters.length === 0) {
    throw new Error(NO_VOTERS)
  }

  for (const voter of voters) {
    if (!isUuidValid(identities, voter)) {
      throw new Error(INVALID_VOTER(voter))
    }
  }

  return true
}

export const getRandomToken = (): string => {
  return crypto.randomBytes(64).toString('hex')
}

router.post('/registerVoters', async (req, res) => {
  const voters: string[] = req.body.voters || []
  const identities = <Identity[]>getListFromDB(IDENTITIES_TABLE)

  // validate given voters (=uuids)
  try {
    areVotersValid(identities, voters)
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message })
    return
  }

  // generate random tokens
  const voterIdentities: Identity[] = identities.filter(i => voters.includes(i.uuid))
  const identityTokens: IdentityToken[] = []
  for (const voterIdentity of voterIdentities) {
    identityTokens.push({
      uuid: voterIdentity.uuid,
      token: getRandomToken(),
    })
  }

  // simply add all token/uuid pairs
  // TODO: how to handle deletion of old tokens?
  // TODO: check if a voter already has a token
  addToList(TOKENS_TABLE, identityTokens)

  // send tokens to access provider
  await axios
    .post(`${process.env.access_provider}/sendTokens`, {
      tokens: identityTokens.map(iT => iT.token), // TODO: shuffle tokens
    })
    .then((response: any) => {
      console.log('Response:', response.data.msg)
      res.status(201).json({ success: true, msg: SUCCESS_MSG })
    })
    .catch((error: any) => {
      console.log('Error:', error)
      res.status(400).json({ success: false, msg: error.message })
      return
    })
})

export default router
