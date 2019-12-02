const Web3 = require('web3')

const ballotContract = require('../toDeploy/Ballot.json')
const moduloLibrary = require('../toDeploy/ModuloMathLib.json')

// TODO: replace dynamically with real address of network
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

const deploy = async (abi: {}, bytecode: string, question?: string) => {
  const hasVotingQuestion = question !== undefined
  const accounts = await web3.eth.getAccounts()

  const deployedContract = await new web3.eth.Contract(abi)
    .deploy({
      data: bytecode,
      arguments: hasVotingQuestion ? [question] : null,
    })
    .send({
      from: accounts[0],
      gas: '6000000',
    })
  const deployAddress = deployedContract.options.address
  return [deployedContract, deployAddress]
}

export const init = async (votingQuestion: string) => {
  try {
    const [libContract, libAddress] = await deploy(moduloLibrary.abi, moduloLibrary.bytecode)
    console.log(`Library deployed at address: ${libAddress}`)
    // replaces the given pattern with the address of the library
    // at compile-time, these "placeholders" are inserted for later
    // replacement by an address
    // we need to manually set the address of the deployed library in order
    // for the Ballot.sol to find it
    const ballotBytecode = ballotContract.bytecode.replace(
      /__ModuloMathLib_________________________/g,

      libAddress.replace('0x', '')
    )
    const Ballot = { ...ballotContract }
    Ballot.bytecode = ballotBytecode
    const [ballot, ballotAddress] = await deploy(Ballot.abi, Ballot.bytecode, votingQuestion)
    console.log(`Ballot deployed at address: ${ballotAddress}`)

    // const question = await ballot.methods.getVotingQuestion().call()
    // console.log(question)

    // TODO: also return ballot contract (variable exists already)
    // inside /src/deploy we then need to generate the system parameters and send them to the deployed contract
    return ballotAddress
  } catch (error) {
    throw new Error('Unable to deploy contracts to the blockchain.')
  }
}
