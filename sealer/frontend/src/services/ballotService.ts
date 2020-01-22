import axios, { AxiosResponse } from 'axios'
import { SEALER_BACKEND_URL } from '../config'

/**
 * Gets the state in the deployed ballot. The sealer backend will call the contract.
 */
export const getBallotState = async () => {
  try {
    const response: AxiosResponse = await axios.get(`${SEALER_BACKEND_URL}/ballotState`)
    return response.data
  } catch (error) {
    console.log(error)
    throw new Error(`Could not get state from sealer backend. ${error.message}`)
  }
}
