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

export const registerEnodeWithAuthority = async (enode: string, connectTo: string) => {
  const body = {
    jsonrpc: '2.0',
    method: 'parity_addReservedPeer',
    params: [enode],
    id: 0,
  }
  await axios.post(connectTo, body, config)
}
