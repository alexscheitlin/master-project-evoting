import axios from 'axios'

const sealerBackendUrl = () =>
  `http://${process.env.REACT_APP_SEALER_BACKEND_IP}:${process.env.REACT_APP_SEALER_BACKEND_PORT}`

export const getState = async () => {
  try {
    const response = await axios.get(sealerBackendUrl() + '/state')
    return response.data
  } catch (error) {
    console.log(error)
    throw new Error(`Could not get state from sealer backend. ${error.message}`)
  }
}

export const isBallotDeployed = async (): Promise<boolean> => {
  try {
    const response = await axios.get(sealerBackendUrl() + '/deploy')
    return response.data.deployed
  } catch (error) {
    console.log(error)
    throw new Error(`Could not check if ballot was deployed: ${error.message}`)
  }
}

export const getWalletAddress = async (): Promise<string> => {
  try {
    const response = await axios.get(sealerBackendUrl() + '/register')
    return response.data.result
  } catch (error) {
    console.log(error)
    throw new Error(`Could not get wallet from sealer backend. ${error.message}`)
  }
}

export const registerWallet = async (wallet: string) => {
  try {
    await axios.post(sealerBackendUrl() + '/register')
  } catch (error) {
    console.log(error)
    throw new Error(`The sealer backend was unable to register the wallet ${wallet}. ${error.message}`)
  }
}

export const loadConfiguration = async () => {
  try {
    await axios.get(sealerBackendUrl() + '/chainspec')
  } catch (error) {
    console.log(error)
    throw new Error(`Could not connect to sealer backend to get blockchain specification. ${error.message}`)
  }
}

export const registerMySealerNode = async () => {
  try {
    const response = await axios.post(sealerBackendUrl() + '/peer')
    return response.data
  } catch (error) {
    console.log(error)
    throw new Error(`Could not connect to sealer backend to find peers. ${error.message}`)
  }
}

export const getNrPeers = async (): Promise<number> => {
  try {
    const response = await axios.get(sealerBackendUrl() + '/peer')
    return response.data.nrOfPeers
  } catch (error) {
    console.log(error)
    throw new Error(`The sealer backend was unable to return the number of peers. ${error.message}`)
  }
}

export const generateKeys = async () => {
  try {
    const response = await axios.post(sealerBackendUrl() + '/generateKeys')
    console.log(response.data)
  } catch (error) {
    console.log(error)
    throw new Error(`Something went wrong with key generation. ${error.message}`)
  }
}

export const decryptShare = async () => {
  try {
    return await axios.post(sealerBackendUrl() + '/decrypt', {})
  } catch (error) {
    console.log(error)
    throw new Error(`Something went wrong with decrypting the share. ${error.message}`)
  }
}
