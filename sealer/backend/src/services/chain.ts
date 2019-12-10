import { getWeb3 } from '../utils/web3'

export const getPeerCount = async () => {
  const web3 = getWeb3()
  const connectedAuthorities = await web3.eth.net.getPeerCount()
  return connectedAuthorities
}
