import { getWeb3 } from '../utils/web3'

export const getPeerCount = async (): Promise<number> => {
  const web3 = getWeb3()
  const connectedAuthorities = await web3.eth.net.getPeerCount()
  return connectedAuthorities
}
