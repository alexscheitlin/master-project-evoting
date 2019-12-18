import crypto = require('crypto')
import express from 'express'

import { addToList, getListFromDB, IDENTITIES_TABLE, TOKENS_TABLE } from '../database/database'
import { Identity, IdentityToken } from '../models'
import { shuffle } from '../utils/shuffle'

const axios = require('axios')
const router: express.Router = express.Router()

// http response messages
const NO_VOTERS: string = 'No voters specified!'
const INVALID_VOTER = (uuid: string): string => `UUID does not exist: ${uuid}`
const SUCCESS_MSG: string = 'Successfully registered voters!'
const ALREADY_REGISTERED: string = 'The provided voters are already registered!'
const ACCESS_PROVIDER_NOT_REACHABLE = 'Sorry, the tokens could not be sent to the access provider!'

export const areVotersValid = (identities: Identity[], voters: string[]): boolean | Error => {
  // check if some voters are specified
  if (voters.length === 0) {
    throw new Error(NO_VOTERS)
  }

  for (const voterUUID of voters) {
    // check if there is an identity with the given uuid
    if (!identities.map(i => i.uuid).includes(voterUUID)) {
      throw new Error(INVALID_VOTER(voterUUID))
    }
  }

  return true
}

export const getRandomToken = (): string => {
  return crypto.randomBytes(64).toString('hex')
}

router.post('/registerVoters', async (req, res) => {
  const voters: string[] = req.body.voters || []
  const identities = getListFromDB(IDENTITIES_TABLE) as Identity[]
  const tokens = getListFromDB(TOKENS_TABLE) as IdentityToken[]

  // validate given voters (= uuids)
  try {
    areVotersValid(identities, voters)
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message })
    return
  }

  // generate random tokens for all voters that not already have one
  const identityTokens: IdentityToken[] = []
  identities
    .filter(identity => voters.includes(identity.uuid))
    .map(identity => identity.uuid)
    .filter(uuid => !tokens.map(identityToken => identityToken.uuid).includes(uuid))
    .filter(uuid => uuid !== null)
    .map(uuid =>
      identityTokens.push({
        uuid: uuid,
        token: getRandomToken(),
      })
    )

  // send tokens to access provider
  if (identityTokens.length === 0) {
    res.status(200).json({
      success: true,
      msg: ALREADY_REGISTERED,
    })
  } else {
    try {
      await axios.post(
        `http://${process.env.ACCESS_PROVIDER_BACKEND_IP}:${process.env.ACCESS_PROVIDER_BACKEND_PORT}/sendTokens`,
        {
          tokens: shuffle(identityTokens.map(iT => iT.token)),
        }
      )
    } catch (error) {
      res.status(400).json({ success: false, msg: ACCESS_PROVIDER_NOT_REACHABLE, error: error.message })
      return
    }

    // store generated token/uuid pairs
    addToList(TOKENS_TABLE, identityTokens)

    res.status(201).json({
      success: true,
      msg: SUCCESS_MSG,
      alreadyRegistered: voters.length - identityTokens.length,
      newlyRegistered: identityTokens.length,
    })
  }
})

export default router
