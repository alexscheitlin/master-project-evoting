import axios, { AxiosResponse } from 'axios'
import { VotingState } from '../models/states'

const sealerBackendUrl = (): string =>
  `http://${process.env.REACT_APP_SEALER_BACKEND_IP}:${process.env.REACT_APP_SEALER_BACKEND_PORT}`

// TODO: Think about improving the StateResponse since it's not always the same!
interface StateResponse {
  state: VotingState
  registeredSealers: number
  requiredSealers: number
}

export const getState = async (): Promise<StateResponse> => {
  try {
    const response: AxiosResponse = await axios.get(sealerBackendUrl() + '/state')
    return response.data.state
  } catch (error) {
    console.log(error)
    throw new Error(`Could not get state from sealer backend. ${error.message}`)
  }
}

export const isBallotDeployed = async (): Promise<boolean> => {
  try {
    const response: AxiosResponse = await axios.get(sealerBackendUrl() + '/deploy')
    return response.data.deployed
  } catch (error) {
    console.log(error)
    throw new Error(`Could not check if ballot was deployed: ${error.message}`)
  }
}

export const getWalletAddress = async (): Promise<string> => {
  try {
    const response: AxiosResponse = await axios.get(sealerBackendUrl() + '/register')
    return response.data.result
  } catch (error) {
    console.log(error)
    throw new Error(`Could not get wallet from sealer backend. ${error.message}`)
  }
}

export const registerWallet = async (wallet: string): Promise<void> => {
  try {
    const response: AxiosResponse = await axios.post(sealerBackendUrl() + '/register')
    if (!(response.status === 201)) {
      throw new Error(`POST /register failed -> Status Code: ${response.status}`)
    }
  } catch (error) {
    console.log(error)
    throw new Error(`The sealer backend was unable to register the wallet ${wallet}. ${error.message}`)
  }
}

export const loadConfiguration = async (): Promise<void> => {
  try {
    const response: AxiosResponse = await axios.get(sealerBackendUrl() + '/chainspec')
    if (!(response.status === 200)) {
      throw new Error(`GET /chainspec failed -> Status Code: ${response.status}`)
    }
  } catch (error) {
    console.log(error)
    throw new Error(`Could not connect to sealer backend to get blockchain specification. ${error.message}`)
  }
}

interface RegisterSealerResponse {
  bootnode: boolean
}

export const registerMySealerNode = async (): Promise<RegisterSealerResponse> => {
  try {
    const response: AxiosResponse = await axios.post(sealerBackendUrl() + '/peer')
    if (response.status === 201) {
      return response.data
    } else {
      throw new Error(`POST /peer failed -> Status Code: ${response.status}`)
    }
  } catch (error) {
    console.log(error)
    throw new Error(`Could not connect to sealer backend to find peers. ${error.message}`)
  }
}

export const getNrPeers = async (): Promise<number> => {
  try {
    const response: AxiosResponse = await axios.get(sealerBackendUrl() + '/peer')
    if (response.status === 200) {
      return response.data.nrOfPeers
    } else {
      throw new Error(`GET /peer failed -> Status Code: ${response.status}`)
    }
  } catch (error) {
    console.log(error)
    throw new Error(`The sealer backend was unable to return the number of peers. ${error.message}`)
  }
}

export const generateKeys = async (): Promise<void> => {
  try {
    const response: AxiosResponse = await axios.post(sealerBackendUrl() + '/generateKeys')
    if (!(response.status === 201)) {
      throw new Error(`POST /generateKeys failed -> Status Code: ${response.status}`)
    }
    console.log(response.data)
  } catch (error) {
    console.log(error)
    throw new Error(`Something went wrong with key generation. ${error.message}`)
  }
}

export const decryptShare = async (): Promise<void> => {
  try {
    const response: AxiosResponse = await axios.post(sealerBackendUrl() + '/decrypt', {})
    if (!(response.status === 201)) {
      throw new Error(`POST /decrypt failed -> Status Code: ${response.status}`)
    }
  } catch (error) {
    console.log(error)
    throw new Error(`Something went wrong with decrypting the share. ${error.message}`)
  }
}
