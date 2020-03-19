/* eslint-disable no-undef */
import axios from 'axios'
import { ACCESS_PROVIDER_URL } from '../constants'
import { VotingState } from '../models/voting'

interface FundWalletResponse {
  success: boolean
  ballot: string
}

/**
 * Sends an ETH address and a token to the access provider, which will send Ether to the
 * specified wallet
 * @param token the token received from the access provider backend
 * @param wallet the ETH address of the voter that will be funded
 */
export const fundWallet = async (token: string, wallet: string): Promise<FundWalletResponse> => {
  const requestBody = {
    token: token,
    address: wallet,
  }
  try {
    const res = await axios.post(`${ACCESS_PROVIDER_URL}/register`, requestBody)
    // return the ballot contract address
    return {
      success: res.data.success,
      ballot: res.data.ballot,
    }
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
    const res = await axios.get(`${ACCESS_PROVIDER_URL}/getNodeURL`)
    return res.data.node
  } catch (error) {
    throw new Error(`Could not get connection node from the access provider: ${error.response.data.msg}`)
  }
}

interface StateResponse {
  state: VotingState
  address: string
}

export const getState = async (): Promise<StateResponse> => {
  try {
    const res = await axios.get(`${ACCESS_PROVIDER_URL}/state`)
    return {
      state: res.data.state,
      address: res.data.address,
    }
  } catch (error) {
    throw new Error(`Could not get connection node from the access provider: ${error.response.data.msg}`)
  }
}
