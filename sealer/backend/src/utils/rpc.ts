import axios from 'axios'

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
}

export const getEnodeAtPort = async (port: string): Promise<string> => {
  const body = {
    jsonrpc: '2.0',
    method: 'parity_enode',
    params: [],
    id: 0,
  }
  const response = await axios.post('http://localhost:' + port, body, config)
  return response.data.result
}

export const registerEnodeWithAuthority = async (enode: string) => {
  const body = {
    jsonrpc: '2.0',
    method: 'parity_addReservedPeer',
    params: [enode],
    id: 0,
  }
  await axios.post('http://localhost:' + process.env.REGISTRATION_NODE_URL, body, config)
}
