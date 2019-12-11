import axios from 'axios'
import fs from 'fs'

import { config } from '../config'

export const fetchAndStoreChainspec = async () => {
  let result
  let chainspec
  try {
    result = await axios.get(config.authBackend.devUrl + '/chainspec')
  } catch (error) {
    console.log(error)
    throw new Error('Unable to fetch the chainspec from the auth backend. Check if the system is in the correct state.')
  }

  try {
    chainspec = JSON.stringify(result.data)
    fs.writeFileSync('src/chainspec/chain.json', chainspec)
  } catch (error) {
    console.log(error)
    throw new Error('Could not store the chainspec to src/chainspec/chain.json')
  }
}

export const getBootNodeUrl = async (myUrl: string) => {
  let bootnode
  try {
    // get bootnode from auth backend
    const response = await axios.post(config.authBackend.devUrl + '/connectionNode', {
      url: myUrl,
    })
    bootnode = response.data.connectTo
  } catch (error) {
    console.log(error)
    throw new Error('Could not get the bootnode from the authority backend.')
  }
  return bootnode
}

export const registerWallet = async (addressToRegister: string) => {
  try {
    await axios.post(config.authBackend.devUrl + '/chainspec', {
      address: addressToRegister,
    })
  } catch (error) {
    console.log(error)
    throw new Error(`Could not register ${addressToRegister} with the authority backend.`)
  }
}

export const getBallotAddress = async () => {
  let ballotAddress
  try {
    const response = await axios.get(config.authBackend.devUrl + '/deploy')
    ballotAddress = response.data.address
  } catch (error) {
    console.log(error)
    throw new Error('Unable to get the address of the ballot from the authority backend.')
  }

  return ballotAddress
}
