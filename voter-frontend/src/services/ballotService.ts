import { FFelGamal } from '@meck93/evote-crypto'
import BN from 'bn.js'
import Web3 from 'web3'

/**
 * Create FFelGamal.SystemParameters from the returned numbers array from
 * the ballot contract
 * @param params array of BNs
 */
export const toSystemParams = (params: BN[]): FFelGamal.SystemParameters => {
  const systemParams: FFelGamal.SystemParameters = {
    p: new BN(params[0]),
    q: new BN(params[1]),
    g: new BN(params[2]),
  }
  return systemParams
}

/**
 * Utility function to properly encode numbers for solidity
 * @param number BN number to convert
 */
const toHex = (number: BN): string => Web3.utils.toHex(number)

/**
 * Sends a vote to the blockchain to be verified and accepted
 * @param proof proof of the vote
 * @param vote the cipher of the vote
 * @param contract the contract object
 * @param wallet the ETH address
 */
const submitVote = async (
  proof: FFelGamal.Proof.MembershipProof,
  vote: FFelGamal.Cipher,
  contract: any,
  wallet: string
): Promise<boolean> => {
  try {
    const res = await contract.methods
      .vote(
        [toHex(vote.a), toHex(vote.b)],
        [toHex(proof.a0), toHex(proof.a1)],
        [toHex(proof.b0), toHex(proof.b1)],
        [toHex(proof.c0), toHex(proof.c1)],
        [toHex(proof.f0), toHex(proof.f1)]
      )
      .send({ from: wallet })

    // TODO: check returnValues field on response -> event emitted from Ballot
    // If user votes altough the vote is closed, the UI renders it as success
    console.log(res)
    return true
  } catch (error) {
    throw new Error(`Vote submission failed: ${error.message}`)
  }
}

/**
 * Fetches the system parameters and the public key from the
 * ballot contract
 * @param contract the solidity contract object
 */
const getContractParameters = async (contract: any): Promise<[BN, FFelGamal.SystemParameters]> => {
  let systemParameters: FFelGamal.SystemParameters
  let publicKey: BN

  try {
    const paramsFromContract = await contract.methods.getParameters().call()

    systemParameters = toSystemParams(paramsFromContract)
  } catch (error) {
    throw new Error(`Unable to get system parameters from contract: ${error.message}`)
  }

  try {
    publicKey = await contract.methods.getPublicKey().call()
  } catch (error) {
    throw new Error(`Unable to get public key from contract: ${error.message}`)
  }

  return [new BN(publicKey), systemParameters]
}

/**
 * Creates a yes vote and proof and submits these to the ballot contract,
 * where both are verified and stored.
 * @param contract the solidity contract object
 * @param wallet ETH public key
 */
export const castYesVote = async (contract: any, wallet: string): Promise<boolean> => {
  const [publicKey, systemParameters] = await getContractParameters(contract)
  const vote = FFelGamal.Voting.generateYesVote(systemParameters, publicKey)
  const proof = FFelGamal.Proof.Membership.generateYesProof(vote, systemParameters, publicKey, wallet)

  try {
    await submitVote(proof, vote, contract, wallet)
    return true
  } catch (error) {
    throw new Error(`Could not send vote and proof to contract: ${error.message}`)
  }
}

/**
 * Creates a no vote and proof and submits these to the ballot contract,
 * where both are verified and stored.
 * @param contract the solidity contract object
 * @param wallet ETH public key
 */
export const castNoVote = async (contract: any, wallet: string): Promise<boolean> => {
  const [publicKey, systemParameters] = await getContractParameters(contract)
  // generate and submit noVote
  const vote = FFelGamal.Voting.generateNoVote(systemParameters, publicKey)
  const proof = FFelGamal.Proof.Membership.generateNoProof(vote, systemParameters, publicKey, wallet)

  try {
    await submitVote(proof, vote, contract, wallet)
    return true
  } catch (error) {
    throw new Error(`Could not send vote and proof to contract: ${error.message}`)
  }
}

/**
 * Fetches the final voting result -> number of yes votes.
 */
export const getVoteResult = async (contract: any): Promise<number> => {
  try {
    return await contract.methods.getVoteResult().call()
  } catch (error) {
    console.log(error)
    throw new Error(`The final voting result could not be fetched. ${error}`)
  }
}

/**
 * Gets number of votes
 */
export const getNumberOfVotes = async (contract: any): Promise<number> => {
  try {
    return await contract.methods.getNumberOfVotes().call()
  } catch (error) {
    throw new Error('The number of votes could not be assessed.')
  }
}

/**
 * Gets the voting question
 */
export const getVotingQuestion = async (contract: any): Promise<string> => {
  try {
    const question: string = await contract.methods.getVotingQuestion().call()
    return question
  } catch (error) {
    console.log(error)
    throw new Error('Could not get the voting question from the contract')
  }
}
