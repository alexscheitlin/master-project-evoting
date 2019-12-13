import { config } from 'dotenv'

// Important. This is needed, else the provess.env variables are undefined
config()

export const parityConfig = {
  numberOfAuthorityNodes: 3,
  // node to connect to and account to deploy the contracts and interact with them
  nodeUrl: `http://${process.env.PARITY_NODE_IP}:${process.env.PARITY_NODE_PORT}`,
  accountAddress: '0x004ec07d2329997267ec62b4166639513386f32e',
  accountPassword: 'user',
}
