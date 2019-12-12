import axios from 'axios'

const config = { headers: { 'Content-Type': 'application/json' } }

export const createAccount = async (url: string, password: string, passphrase: string): Promise<string> => {
  const body = {
    jsonrpc: '2.0',
    method: 'parity_newAccountFromPhrase',
    params: [password, passphrase],
    id: 0,
  }
  const response = await axios.post(url, body, config)

  if (!!response.data.error) {
    throw new Error(response.data.error.message)
  }
  return response.data.result
}
