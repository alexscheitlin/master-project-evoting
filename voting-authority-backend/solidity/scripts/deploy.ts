import { getWeb3 } from '../../src/utils/web3'

const ballotContract = require('../toDeploy/Ballot.json')
const moduloLibrary = require('../toDeploy/ModuloMathLib.json')

const web3 = getWeb3()

const deploy = async (abi: any, bytecode: string, question?: string): Promise<string> => {
  const hasVotingQuestion = question !== undefined
  // TODO: figure out how to unlock the prefunded account which we will place inside the
  // chainspec of the parity chain. Currently asuming that Authority has first account
  const accounts = await web3.eth.getAccounts()

  const deployedContract = await new web3.eth.Contract(abi)
    .deploy({
      data: bytecode,
      arguments: hasVotingQuestion ? [question] : undefined,
    })
    .send({
      from: accounts[0],
      gas: 6000000,
    })
  return deployedContract.options.address
}

export const init = async (votingQuestion: string) => {
  try {
    const libAddress = await deploy(moduloLibrary.abi, moduloLibrary.bytecode)
    console.log(`Library deployed at address: ${libAddress}`)
    // replaces the given pattern with the address of the library
    // at compile-time, these "placeholders" are inserted for later
    // replacement by an address
    // we need to manually set the address of the deployed library in order
    // for the Ballot.sol to find it
    const ballotBytecode = ballotContract.bytecode.replace(
      /__ModuloMathLib_________________________/g,
      (libAddress as string).replace('0x', '')
    )
    const Ballot = { ...ballotContract }
    Ballot.bytecode = ballotBytecode
    const ballotAddress = await deploy(Ballot.abi, Ballot.bytecode, votingQuestion)
    console.log(`Ballot deployed at address: ${ballotAddress}`)

    return ballotAddress
  } catch (error) {
    throw new Error(`Contract Deployment failed: ${JSON.stringify(error)}`)
  }
}
