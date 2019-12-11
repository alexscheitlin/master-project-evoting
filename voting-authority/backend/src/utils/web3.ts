import Web3 from 'web3'
import { parityConfig } from '../config'

export const getWeb3 = (): Web3 => {
  const provider = new Web3.providers.HttpProvider(parityConfig.nodeUrl)
  return new Web3(provider)
}

// unlock the authority account and return its address
// TODO: create voting-auth-account with axios/RPC (see _old, create account)
export const unlockAuthAccount = async () => {
  try {
    // ignore the unlockAccount call as it expects a number but parity
    // does only work with hex numbers
    // null => 300 seconds (default)
    // @ts-ignore
    await getWeb3().eth.personal.unlockAccount(parityConfig.accountAddress, parityConfig.accountPassword, null)
  } catch (error) {
    throw new Error('Could not unlock the authority account (web3.eth.personal.unlockAccount).')
  }
  return parityConfig.accountAddress
}

export const getNumberOfConnectedAuthorities = async (): Promise<number> => {
  let connectedAuthorities: number
  try {
    connectedAuthorities = await getWeb3().eth.net.getPeerCount()
  } catch (error) {
    throw new Error('Could not get the number of connected authorities (web3.eth.net.getPeerCount).')
  }
  return connectedAuthorities + 1
}
