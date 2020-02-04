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

export const registerEnodeWithAuthority = async (enode: string, connectTo: string): Promise<void> => {
  const body = {
    jsonrpc: '2.0',
    method: 'parity_addReservedPeer',
    params: [enode],
    id: 0,
  }
  await axios.post(connectTo, body, config)
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
