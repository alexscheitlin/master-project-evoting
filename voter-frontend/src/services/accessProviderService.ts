/* eslint-disable no-undef */
import axios from 'axios'

const getAccessProviderUrl = (): string =>
  `http://${process.env.REACT_APP_ACCESS_PROVIDER_IP}:${process.env.REACT_APP_ACCESS_PROVIDER_PORT}`

/**
 * Sends an ETH address and a token to the access provider, which will send Ether to the
 * specified wallet
 * @param token the token received from the access provider backend
 * @param wallet the ETH address of the voter that will be funded
 */
export const fundWallet = async (token: string, wallet: string): Promise<string> => {
  const requestBody = {
    token: token,
    address: wallet,
  }
  try {
    const res = await axios.post(getAccessProviderUrl() + '/register', requestBody)
    // return the ballot contract address
    return res.data.ballot
  } catch (error) {
    throw new Error(
      `Something went wrong when sending ${wallet} to access provider to get the wallet funded. ${error.response.data.msg}`
    )
  }
}

/**
 * Get the url at which the blockchain can be reached
 */
export const getConnectionNodeUrl = async (): Promise<string> => {
  try {
    const res = await axios.get(getAccessProviderUrl() + '/getNodeURL')
    return res.data.node
  } catch (error) {
    throw new Error(`Could not get connection node from the access provider: ${error.response.data.msg}`)
  }
}
