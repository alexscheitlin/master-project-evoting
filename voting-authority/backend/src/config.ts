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

// List of all addresses which are never allowed to cast votes
// this includes:
// - Voting Authority
// - Sealers (3x prefunded wallets)
// - Access Provider
export const priviledgedAddresses = [
  '0x004ec07d2329997267ec62b4166639513386f32e',
  '0x004661de90cd1dcb998e8464a0f3c3da9f085950',
  '0x98b32c998f16e36cff94b430c656335d682e78dd',
  '0x3e5006ae356a01f2b6fa1c473fb49d73a609d4eb',
  '0x82f876d4bbb1b017e0d730f12d9721e0a2b1fe16',
]
