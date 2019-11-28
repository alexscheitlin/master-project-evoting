import express from 'express'
import { getListFromDB } from '../database/database'
import { Identity } from '../models'

const router: express.Router = express.Router()

// database table names
const IDENTITIES: string = 'identities'

// http response messages
const NO_VOTERS: string = 'No voters specified!'
const INVALID_VOTER = (uuid: string) => `No uuid found for: ${uuid}`
const SUCCESS_MSG: string = 'Successfully registered voters!'

// check if there is an identity with the given uuid
export const isUuidValid = (uuid: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getListFromDB won't work any more
  const identities = <Identity[]>getListFromDB(IDENTITIES)
  return identities.map(i => i.uuid).includes(uuid)
}

export const areVotersValid = (voters: string[]): boolean | Error => {
  if (voters.length === 0) {
    throw new Error(NO_VOTERS)
  }

  for (const voter of voters) {
    if (!isUuidValid(voter)) {
      throw new Error(INVALID_VOTER(voter))
    }
  }

  return true
}

router.post('/registerVoters', (req, res) => {
  const voters: string[] = req.body.voters || []

  try {
    areVotersValid(voters)
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message })
    return
  }

  // TODO: generate and store tokens

  // TODO: send tokens to access provider

  res.status(201).json({ success: true, msg: SUCCESS_MSG })
})

export default router
