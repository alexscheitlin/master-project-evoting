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
  const response = await axios.post(`http://${process.env.PARITY_NODE_IP}:${port}`, body, config)
  return response.data.result
}

export const registerEnodeWithAuthority = async (enode: string, connectTo: string) => {
  const body = {
    jsonrpc: '2.0',
    method: 'parity_addReservedPeer',
    params: [enode],
    id: 0,
  }
  console.log('before response', connectTo, body, config)
  const response = await axios.post(connectTo, body, config)
  console.log('response:', response)
}
