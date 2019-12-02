import Web3 from 'web3'

export const getWeb3 = (): Web3 => {
  // TODO: replace dynamically with real address of network
  const provider = new Web3.providers.HttpProvider('http://localhost:8545')
  const web3: Web3 = new Web3(provider)

  return web3
}
