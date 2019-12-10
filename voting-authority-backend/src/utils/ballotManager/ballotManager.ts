import BN = require('bn.js')
import { FFelGamal } from 'mp-crypto'

import { getValueFromDB, BALLOT_ADDRESS_TABLE } from '../../database/database'
import { getWeb3 } from '../web3'
import { parityConfig } from '../../config'

const ballotContract = require('../../../solidity/toDeploy/Ballot.json')

const web3 = getWeb3()

const GAS_LIMIT = 6000000

const toHex = (number: BN) => web3.utils.toHex(number)

/**
 * Returns a Contract object with which one can interface with the Ballot.
 */
const getContract = () => {
  const contractAddress: string = getValueFromDB(BALLOT_ADDRESS_TABLE)
  const contract = new web3.eth.Contract(ballotContract.abi, contractAddress)
  return contract
}

/**
 * Returns the account of the Authority
 */
export const getAuthAccount = async () => {
  // TODO: create voting-auth-account with axios/RPC (see _old, create account)
  // ignore the unlockAccount call as it expects a number but parity does only work with hex numbers
  // null => 300 seconds (default)
  // @ts-ignore
  await web3.eth.personal.unlockAccount(parityConfig.accountAddress, parityConfig.accountPassword, null)
  return parityConfig.accountAddress
}

export const setSystemParameters = async () => {
  const contract = getContract()
  const authAcc = await getAuthAccount()

  // TODO: how do we generate suitable params?
  const p_: number = 23
  const g_: number = 2
  const bund_systemParams: FFelGamal.SystemParameters = FFelGamal.SystemSetup.generateSystemParameters(p_, g_)
  try {
    await contract.methods
      .setParameters([toHex(bund_systemParams.p), toHex(bund_systemParams.q), toHex(bund_systemParams.g)])
      .send({ from: authAcc, gas: GAS_LIMIT })
  } catch (error) {
    throw new Error('System parameters could not be initialized.')
  }
}

/**
 * Generates the public key of the system. The public key will consist of multiple
 * key shares submitted by the sealer nodes. Hence, this function can only be called
 * once all shares are submitted and stored inside the contract.
 */
export const generatePublicKey = async () => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    await contract.methods.generatePublicKey().send({ from: authAcc, gas: GAS_LIMIT })
  } catch (error) {
    throw new Error('The public key of the system could not be created.')
  }
}

/**
 * Will create verifiers for the system parameters set inside the contract.
 */
export const createVerifiers = async () => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    await contract.methods.createVerifiers().send({ from: authAcc, gas: GAS_LIMIT })
  } catch (error) {
    throw new Error('The verifiers could not be created')
  }
}

/**
 * Opens the ballot for voting. Inside the contract, IS_VOTING_OPEN is set to true.
 */
export const openBallot = async () => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    await contract.methods.openBallot().send({ from: authAcc, gas: GAS_LIMIT })
  } catch (error) {
    throw new Error('The Ballot could no be opened. Make sure you are the owner and it is not already open.')
  }
}

/**
 * Closes the ballot and prevents further votes from being recorded.
 */
export const closeBallot = async () => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    await contract.methods.closeBallot().send({ from: authAcc, gas: GAS_LIMIT })
  } catch (error) {
    throw new Error('The Ballot could no be closed.')
  }
}

/**
 * Returns a boolean indicating if the ballot is still open.
 */
export const isBallotOpen = async (): Promise<boolean> => {
  const contract = getContract()
  try {
    return await contract.methods.getBallotStatus().call()
  } catch (error) {
    throw new Error('The status of the Ballot could no be fetched.')
  }
}

export const getNrOfPublicKeyShares = async (): Promise<number> => {
  const contract = getContract()
  try {
    return parseInt(await contract.methods.getNrOfPublicKeyShares().call())
  } catch (error) {
    throw new Error('The number of public key shares could not be fetched.')
  }
}

/**
 * Combines the decrypted shares that were previously submitted by each authority.
 * Together they will generate the final decrypted result of the ballot.
 */
export const combineDecryptedShares = async (): Promise<boolean> => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    return await contract.methods.combineDecryptedShares().send({ from: authAcc, gas: GAS_LIMIT })
  } catch (error) {
    throw new Error('The decrypted shares could no be combined.')
  }
}

/**
 * Fetches the final voting result -> number of yes votes.
 */
export const getVoteResult = async (): Promise<number> => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    return await contract.methods.getVoteResult().call({ from: authAcc })
  } catch (error) {
    throw new Error('The final voting result could not be fetched. Maybe the voting is still ongoing.')
  }
}

/**
 * Gets number of votes
 */
export const getNumberOfVotes = async (): Promise<number> => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    return await contract.methods.getNumberOfVotes().call({ from: authAcc })
  } catch (error) {
    throw new Error('The number of votes could not be assessed.')
  }
}
