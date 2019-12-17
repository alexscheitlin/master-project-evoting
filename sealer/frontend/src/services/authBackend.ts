import axios, { AxiosResponse } from 'axios'

import { config } from '../config'
import { VotingState } from '../models/states'

// TODO: Think about improving the StateResponse since it's not always the same!
interface StateResponse {
  state: VotingState
  registeredSealers: number
  requiredSealers: number
}

export const subscribeToChainspec = async () => {
  const url = config.authBackend.devUrl
  try {
    await axios.post(url + '/register')
  } catch (error) {
    throw new Error(`Could not subscribe to state in auth backend: ${error.message}`)
  }
}

export const getState = async (): Promise<StateResponse> => {
  try {
    const response: AxiosResponse<StateResponse> = await axios.get(config.authBackend.devUrl + '/state')
    return response.data
  } catch (error) {
    throw new Error(`Could not fetch state from auth backend: ${error.message}`)
  }
}
