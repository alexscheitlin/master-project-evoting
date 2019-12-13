import Web3 from 'web3'

import { serverConfig } from '../config'

export const getWeb3 = (): Web3 => {
  const provider = new Web3.providers.HttpProvider(process.env.CHAIN_URL as string)
  const web3: Web3 = new Web3(provider)
  return web3
}

// unlock the access provider account and return its address
export const unlockAuthAccount = async () => {
  try {
    // ignore the unlockAccount call as it expects a number but parity does only work with hex numbers
    // null => 300 seconds (default)
    // @ts-ignore
    await getWeb3().eth.personal.unlockAccount(parityConfig.accountAddress, parityConfig.accountPassword, null)
  } catch (error) {
    throw new Error('Could not unlock the authority account (web3.eth.personal.unlockAccount).')
  }
  return serverConfig.accountAddress
}
