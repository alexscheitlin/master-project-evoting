/* eslint-disable no-undef */
import axios from 'axios'

const getIdentityProviderUrl = (): string =>
  `http://${process.env.REACT_APP_IDENTITY_PROVIDER_IP}:${process.env.REACT_APP_IDENTITY_PROVIDER_PORT}`

/**
 * Login function, will send username and password to the access provider backend
 * to get a token. This token is used later for getting a ETH wallet funded
 * @param username
 * @param password
 */
export const getToken = async (username: string, password: string): Promise<string> => {
  const requestBody = {
    username: username,
    password: password,
  }

  try {
    const res = await axios.post(getIdentityProviderUrl() + '/getToken', requestBody)
    return res.data.token
  } catch (error) {
    throw new Error(`Login unsuccessful: ${error.response.data.msg}`)
  }
}
