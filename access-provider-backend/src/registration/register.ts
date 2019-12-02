import express from 'express'
import { verifyAddress } from '../utils/addressVerification'
import { getListFromDB, addToList } from '../database/database'
import { fundWallet } from '../utils/fundWallet'
import { getBallotAddress } from '../utils/getBallotAddress'

const router: express.Router = express.Router()

// database table names
const USED_TOKENS: string = 'usedSignupTokens'
const REGISTERED_VOTERS: string = 'voters'
const VALID_TOKENS: string = 'validSignupTokens'

// http response messages
const ADDRESS_INVALID: string = 'Address registration failed. Address is not valid or has already been registered.'
const TOKEN_INVALID: string = 'Address registration failed. Signup token is not valid or has already been used.'
const BOTH_INVALID: string = 'Address registration failed. Both token and address are not valid.'
const SUCCESS_MSG: string = 'Successfully verified token and registered address. Happy Voting!'

export const verifyVoterToken = (token: string): boolean => {
  return isTokenValid(token) && hasTokenAlreadyBeenUsed(token)
}

export const isTokenValid = (token: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getListFromDB won't work any more
  const validTokens = getListFromDB(VALID_TOKENS)
  return validTokens.includes(token)
}

export const hasTokenAlreadyBeenUsed = (token: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getListFromDB won't work any more
  const usedTokens = getListFromDB(USED_TOKENS)
  return !usedTokens.includes(token)
}

router.post('/register', async (req, res) => {
  const voterToken: string = req.body.token
  const voterAddress: string = req.body.address

  const isTokenValid: boolean = verifyVoterToken(voterToken)
  const isAddressValid: boolean = verifyAddress(REGISTERED_VOTERS, voterAddress)
  const success: boolean = isTokenValid && isAddressValid

  // FIXME: replace with `success` once ready, currently we don't have the tokens from the Identity Provider yet.
  // So any token right now is valid, as long as as there is also a valid eth address
  if (isAddressValid) {
    addToList(USED_TOKENS, voterToken)
    addToList(REGISTERED_VOTERS, voterAddress)

    // at this point, the address and token are correct
    // now we need to fund the wallet and reply with the address of the ballot contract
    // the address of the ballot is fetched from the auth backend
    const ballotAddress = await getBallotAddress()
    await fundWallet(voterAddress)

    res.status(201).json({ success: true, msg: SUCCESS_MSG, ballot: ballotAddress })
  } else if (!isTokenValid && !isAddressValid) {
    res.status(400).json({ success: false, msg: BOTH_INVALID })
  } else if (!isTokenValid) {
    res.status(400).json({ success: false, msg: TOKEN_INVALID })
  } else if (!isAddressValid) {
    res.status(400).json({ success: false, msg: ADDRESS_INVALID })
  }
})

export default router
