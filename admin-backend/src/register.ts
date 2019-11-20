import express from 'express'
import { verifyAddress } from './utils'
import { getListFromDB, addToList } from './database/database'

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

router.post('/register', (req, res) => {
  const voterToken: string = req.body.token
  const voterAddress: string = req.body.address

  const isTokenValid: boolean = verifyVoterToken(voterToken)
  const isAddressValid: boolean = verifyAddress(REGISTERED_VOTERS, voterAddress)
  const success: boolean = isTokenValid && isAddressValid

  if (success) {
    addToList(USED_TOKENS, voterToken)
    addToList(REGISTERED_VOTERS, voterAddress)

    // TODO: FUND REGISTERED ADDRESS
    // Make sure that you have access to the Ethereum account of the Bund
    // web3.eth.sendTransaction({from:,to:voterAddress, value:web3.toWei(1, "ether")});

    res.status(201).json({ success: true, msg: SUCCESS_MSG })
  } else if (!isTokenValid && !isAddressValid) {
    res.status(400).json({ success: false, msg: BOTH_INVALID })
  } else if (!isTokenValid) {
    res.status(400).json({ success: false, msg: TOKEN_INVALID })
  } else if (!isAddressValid) {
    res.status(400).json({ success: false, msg: ADDRESS_INVALID })
  }
})

export default router
