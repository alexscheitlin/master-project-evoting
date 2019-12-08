import Web3 from 'web3'

export const getWeb3 = (): Web3 => {
  const port = process.env.SEALER_NODE_URL as string
  const url = 'http://localhost:' + port
  const provider = new Web3.providers.HttpProvider(url)
  const web3: Web3 = new Web3(provider)
  return web3
}
