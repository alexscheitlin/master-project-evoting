import axios from 'axios'
import fs from 'fs'

import { config } from '../config'

export const fetchAndStoreChainspec = async () => {
  const result = await axios.get(config.authBackend.devUrl + '/chainspec')
  const chainspec = JSON.stringify(result.data)
  fs.writeFileSync('src/chainspec/chain.json', chainspec)
}

export const getBootNodeUrl = async (myUrl: string) => {
  // get bootnode from auth backend
  const response = await axios.post(config.authBackend.devUrl + '/connectionNode', {
    url: myUrl,
  })

  return response.data.connectTo
}

export const registerWallet = async (addressToRegister: string) => {
  try {
    const response = await axios.post(config.authBackend.devUrl + '/chainspec', {
      address: addressToRegister,
    })
    console.log(response)
  } catch (error) {
    console.log(error)
  }
}
