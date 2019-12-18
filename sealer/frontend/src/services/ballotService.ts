import axios, { AxiosResponse } from 'axios'
import { VotingState } from '../models/states'

const sealerBackendUrl = (): string =>
  `http://${process.env.REACT_APP_SEALER_BACKEND_IP}:${process.env.REACT_APP_SEALER_BACKEND_PORT}`

/**
 * Gets the state in the deployed ballot. The sealer backend will call the contract.
 */
export const getBallotState = async () => {
  try {
    const response = await axios.get(sealerBackendUrl() + '/ballotState')
    return response.data.state
  } catch (error) {
    console.log(error)
    throw new Error(`Could not get state from sealer backend. ${error.message}`)
  }
}
