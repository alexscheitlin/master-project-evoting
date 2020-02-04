import axios from 'axios'

const config = { headers: { 'Content-Type': 'application/json' } }

export const createAccountRPC = async (url: string, password: string, passphrase: string): Promise<string> => {
  const body = {
    jsonrpc: '2.0',
    method: 'parity_newAccountFromPhrase',
    params: [password, passphrase],
    id: 0,
  }
  const response = await axios.post(url, body, config)

  if (response.data.error) {
    throw new Error(response.data.error.message)
  }
  return response.data.result
}

export const unlockAccountRPC = async (url: string, password: string, address: string): Promise<string> => {
  const body = {
    jsonrpc: '2.0',
    method: 'personal_unlockAccount',
    params: [address, password, null],
    id: 0,
  }
  const response = await axios.post(url, body, config)

  if (response.data.error) {
    throw new Error(response.data.error.message)
  } else {
    return address
  }
}
