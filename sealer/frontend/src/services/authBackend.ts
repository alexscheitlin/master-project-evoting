import axios from 'axios'

import { config } from '../config'

export const subscribeToChainspec = async (): Promise<void> => {
  const url = config.authBackend.devUrl
  try {
    await axios.post(url + '/register')
  } catch (error) {
    throw new Error(`Could not subscribe to state in auth backend: ${error.message}`)
  }
}
