import express from 'express'
import { isAddress } from 'web3-utils'
import { AdapterSync } from 'lowdb'

import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

const router: express.Router = express.Router()

const adapter: AdapterSync = new FileSync('./src/database/db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ registeredAddresses: [], usedSignupTokens: [], validSignupTokens: ['1', '2', '3', '4'] }).write()

// database table names
const USED_TOKENS: string = 'usedSignupTokens'
const REGISTERED_ADDRESSES: string = 'registeredAddresses'
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
  // needs to be done in two steps -> includes cannot be chained, otherwise getFromDB won't work any more
  const validTokens = getFromDB(VALID_TOKENS)
  return validTokens.includes(token)
}

export const hasTokenAlreadyBeenUsed = (token: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getFromDB won't work any more
  const usedTokens = getFromDB(USED_TOKENS)
  return !usedTokens.includes(token)
}

export const hasAddressAlreadyBeenRegistered = (token: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getFromDB won't work any more
  const registeredAddressess = getFromDB(REGISTERED_ADDRESSES)
  return !registeredAddressess.includes(token)
}

export const verifyAddress = (address: string): boolean => {
  return isAddress(address) && hasAddressAlreadyBeenRegistered(address)
}

export const addToDB = (table: string, value: string) => {
  // read content from DB + add the new value
  const tableContent: string[] = getFromDB(table)
  tableContent.push(value)

  // write the content to the DB
  db.set(table, tableContent).value()
  db.write()
}

export const getFromDB = (table: string): string[] => {
  return db.get(table).value()
}

router.post('/register', (req, res) => {
  const voterToken: string = req.body.token
  const voterAddress: string = req.body.address

  const isTokenValid: boolean = verifyVoterToken(voterToken)
  const isAddressValid: boolean = verifyAddress(voterAddress)
  const success: boolean = isTokenValid && isAddressValid

  if (success) {
    addToDB(USED_TOKENS, voterToken)
    addToDB(REGISTERED_ADDRESSES, voterAddress)

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
