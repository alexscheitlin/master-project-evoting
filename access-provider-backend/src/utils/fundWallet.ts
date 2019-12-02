import { getWeb3 } from './web3'

const web3 = getWeb3()

/**
 * Returns the account of the Access Provider
 */
const getPrefundedAccount = async () => {
  // TODO: figure out how to unlock the prefunded account which we will place inside the
  // chainspec of the parity chain. Currently asuming that Access Provider has the second account.
  const accounts = await web3.eth.getAccounts()
  return accounts[1]
}

export const fundWallet = async (wallet: string) => {
  const account = await getPrefundedAccount()
  try {
    await web3.eth.sendTransaction({ from: account, to: wallet, value: web3.utils.toWei('1', 'ether') })
  } catch (error) {
    throw new Error('Unable to fund given wallet.')
  }
}
