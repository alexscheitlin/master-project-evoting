import BN = require('bn.js')
import { FFelGamal } from '@meck93/evote-crypto'

import { BALLOT_ADDRESS_TABLE, getValueFromDB } from '../database/database'
import { Account } from '../utils'
import { getWeb3 } from '../utils/web3'
import { VotingState } from '../models/states'

const ballotContract = require('../contract-abis/Ballot.json')

const web3 = getWeb3()
const toHex = (number: BN) => web3.utils.toHex(number)

/**
 * Returns a Contract object with which one can interface with the Ballot.
 */
const getContract = () => {
  const web3 = getWeb3()
  const contractAddress: string = getValueFromDB(BALLOT_ADDRESS_TABLE)
  const contract = new web3.eth.Contract(ballotContract.abi, contractAddress)
  return contract
}

/**
 * Returns the account unlocked account
 */
export const getAuthAccount = async () => {
  // read out wallet address
  const wallet = Account.getWallet()
  const password = Account.getPassword()

  // TODO: look at the code from Alex and add the part where we 'create'
  // the account first

  const web3 = getWeb3()

  try {
    // @ts-ignore
    await web3.eth.personal.unlockAccount(wallet, password, null)
    return wallet
  } catch (error) {
    console.log(error)
    throw new Error(`Unable to unlock account for ${wallet}.`)
  }
}

/**
 * Get the system parameters
 */
export const getSystemParameters = async () => {
  const contract = getContract()
  try {
    return await contract.methods.getParameters().call()
  } catch (error) {
    console.log(error)
    throw new Error('Could not get system parameters.')
  }
}

/**
 * Returns a boolean indicating if the ballot is still open.
 */
export const isBallotOpen = async (): Promise<boolean> => {
  const contract = getContract()
  try {
    const status = await contract.methods.getBallotStatus().call()
    return status === VotingState.VOTING
  } catch (error) {
    console.log(error)
    throw new Error('The status of the Ballot could no be fetched.')
  }
}

/**
 * Distributed key generation. Submits one the public key to the Ballot Contract.
 *
 * @param keyShare the sealers public key share
 * @param keyGenProof the sealers proof for the key generation
 */
export const submitPublicKeyShare = async (
  keyShare: FFelGamal.KeyPair,
  keyGenProof: FFelGamal.Proof.KeyGenerationProof
) => {
  const contract = getContract()
  const account = await getAuthAccount()
  try {
    await contract.methods
      .submitPublicKeyShare(toHex(keyShare.h), toHex(keyGenProof.c), toHex(keyGenProof.d))
      .send({ from: account })
  } catch (error) {
    console.log(error)
    throw new Error('The public key share could not be submitted.')
  }
}

/**
 * Returns the number of public key shares inside the ballot contract
 */
export const getNrOfPublicKeyShares = async (): Promise<number> => {
  const contract = getContract()
  try {
    return parseInt(await contract.methods.getNrOfPublicKeyShares().call())
  } catch (error) {
    console.log(error)
    throw new Error('The number of public key shares could not be fetched.')
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
    console.log(error)
    throw new Error(
      'The final voting result could not be fetched. Maybe the voting is still ongoing or something went wrong.'
    )
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
    console.log(error)
    throw new Error('The number of votes could not be assessed.')
  }
}

/**
 * Gets one vote from the ballot
 *
 * @param index the index of the vote
 */
export const getVote = async (index: number) => {
  const contract = getContract()
  const authAcc = await getAuthAccount()
  try {
    return await contract.methods.getVote(index).call({ from: authAcc })
  } catch (error) {
    console.log(error)
    throw new Error(`Could not fetch vote ${index}`)
  }
}

// HELPERS
export const toSystemParams = (params: BN[]): FFelGamal.SystemParameters => {
  const systemParams: FFelGamal.SystemParameters = {
    p: new BN(params[0]),
    q: new BN(params[1]),
    g: new BN(params[2]),
  }
  return systemParams
}

export const getAllVotes = async (): Promise<FFelGamal.Cipher[]> => {
  const votes: FFelGamal.Cipher[] = []
  const voteCount = await getNumberOfVotes()

  for (let i = 0; i < voteCount; i++) {
    const vote = await getVote(i)
    const c: FFelGamal.Cipher = { a: vote[0], b: vote[1] }
    votes.push(c)
  }
  return votes
}

// TODO: move all local crypto operations out of the BallotManager and into a different service
export const homomorphicallyAddVotes = (
  votes: FFelGamal.Cipher[],
  systemParameters: FFelGamal.SystemParameters
): FFelGamal.Cipher => {
  // homomorphically add votes
  return FFelGamal.Voting.addVotes(votes, systemParameters)
}

// TODO: move all local crypto operations out of the BallotManager and into a different service
export const decryptShare = (
  sumCipher: FFelGamal.Cipher,
  systemParameters: FFelGamal.SystemParameters,
  privateKeyShare: BN
): BN => {
  // create decrypted share
  return FFelGamal.Encryption.decryptShare(systemParameters, sumCipher, privateKeyShare)
}

// TODO: move all local crypto operations out of the BallotManager and into a different service
export const generateDecryptionProof = (
  sumCipher: FFelGamal.Cipher,
  systemParameters: FFelGamal.SystemParameters,
  privateKeyShare: BN
): FFelGamal.Proof.DecryptionProof => {
  const uniqueAddress: string = Account.getWallet()

  // create proof for homomorphic sum
  const decryptedShareProof: FFelGamal.Proof.DecryptionProof = FFelGamal.Proof.Decryption.generate(
    sumCipher,
    systemParameters,
    privateKeyShare,
    uniqueAddress
  )
  return decryptedShareProof
}

export const submitDecryptedShare = async (
  sumCipher: FFelGamal.Cipher,
  decryptedShare: BN,
  decryptedShareProof: FFelGamal.Proof.DecryptionProof
) => {
  const contract = getContract()
  const authAcc = await getAuthAccount()

  // submit decrypted share to the contract with a proof
  try {
    return await contract.methods
      .submitDecryptedShare(
        toHex(decryptedShare),
        toHex(sumCipher.a),
        toHex(sumCipher.b),
        toHex(decryptedShareProof.a1),
        toHex(decryptedShareProof.b1),
        toHex(decryptedShareProof.d),
        toHex(decryptedShareProof.f)
      )
      .send({ from: authAcc })
  } catch (error) {
    console.log(error)
    throw new Error('The decrypted share + proof could not be submitted.')
  }
}
