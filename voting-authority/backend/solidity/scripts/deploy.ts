import { Contract } from 'web3-eth-contract'

import { getWeb3, unlockAuthAccount } from '../../src/utils/web3'

const ballotContract = require('../toDeploy/Ballot.json')
const moduloLibrary = require('../toDeploy/ModuloMathLib.json')

const web3 = getWeb3()

const deploy = async (abi: any, bytecode: string, question?: string, numberOfAuthNodes?: number): Promise<string> => {
  const hasVotingQuestion = question !== undefined
  const hasNumberOfAuthNodes = numberOfAuthNodes !== undefined

  const authAccount = await unlockAuthAccount()

  let deployedContract: Contract
  try {
    deployedContract = await new web3.eth.Contract(abi)
      .deploy({
        data: bytecode,
        arguments: [hasVotingQuestion ? question : undefined, hasNumberOfAuthNodes ? numberOfAuthNodes : undefined],
      })
      .send({ from: authAccount, gas: 6000000 })
  } catch (error) {
    throw new Error('Could not deploy the contract (web3.eth.Contract(abi).deploy).')
  }

  return deployedContract.options.address
}

export const init = async (votingQuestion: string, numberOfAuthNodes: number): Promise<string> => {
  try {
    // deploy the modulo math library contract
    const libAddress = await deploy(moduloLibrary.abi, moduloLibrary.bytecode)
    console.log(`Library deployed at address: ${libAddress}`)

    // deploy the ballot contract

    // replace the given pattern with the address of the modulo math library
    // at compile-time
    // these "placeholders" are inserted for later replacement by an address
    // we need to manually set the address of the deployed library in order
    // for the Ballot.sol to find it
    const ballotBytecode = ballotContract.bytecode.replace(
      /__ModuloMathLib_________________________/g,
      (libAddress as string).replace('0x', '')
    )
    const Ballot = { ...ballotContract }
    Ballot.bytecode = ballotBytecode
    const ballotAddress: string = await deploy(Ballot.abi, Ballot.bytecode, votingQuestion, numberOfAuthNodes)
    console.log(`Ballot deployed at address: ${ballotAddress}`)

    return ballotAddress
  } catch (error) {
    throw new Error(`Contract Deployment failed: ${error.message}`)
  }
}
