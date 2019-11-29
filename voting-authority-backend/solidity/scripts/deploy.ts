const Web3 = require('web3')

const ballotContract = require('../compiled/Ballot.json')
const moduloLibrary = require('../compiled/ModuloMathLib.json')

const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

export const deploy = async (abi: {}, bytecode: string) => {
  const accounts = await web3.eth.getAccounts()

  const deployedContract = await new web3.eth.Contract(abi)
    .deploy({
      data: '0x' + bytecode,
    })
    .send({
      from: accounts[0],
      gas: '6000000',
    })
  return deployedContract.options.address
}

export const init = async () => {
  const libAddress = await deploy(moduloLibrary.abi, moduloLibrary.evm.bytecode.object)
  console.log(`Library deployed at address: ${libAddress}`)

  // replaces the given pattern with the address of the library
  // at compile-time, these "placeholders" are inserted for later
  // replacement by an address
  // we need to manually set the address of the deployed library in order
  // for the Ballot.sol to find it
  const ballotBytecode = ballotContract.evm.bytecode.object.replace(
    /__\$2b17134ab1906492f2985bd6a40d21838c\$__/g,

    libAddress.replace('0x', '')
  )
  const Ballot = { ...ballotContract }
  Ballot.evm.bytecode.object = ballotBytecode
  const ballotAddress = await deploy(Ballot.abi, Ballot.evm.bytecode.object)
  console.log(`Ballot deployed at address: ${ballotAddress}`)
}

init()
