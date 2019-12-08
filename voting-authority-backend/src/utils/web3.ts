import Web3 from 'web3'
import { parityConfig } from '../config'

export const getWeb3 = (): Web3 => {
  const provider = new Web3.providers.HttpProvider(parityConfig.nodeUrl)
  const web3: Web3 = new Web3(provider)

  return web3
}
