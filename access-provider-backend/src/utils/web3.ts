import Web3 from 'web3'

export const getWeb3 = (): Web3 => {
  const provider = new Web3.providers.HttpProvider(process.env.CHAIN_URL as string)
  const web3: Web3 = new Web3(provider)
  return web3
}
