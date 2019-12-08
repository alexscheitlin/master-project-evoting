export const parityConfig = {
  numberOfAuthorityNodes: 3,

  // node where sealer nodes can connect themselves once they are running
  connectionNodeUrl: 'http://localhost:8540',

  // node to connect to and account to deploy the contracts and interact with them
  nodeUrl: 'http://localhost:7010',
  accountAddress: '0x004ec07d2329997267ec62b4166639513386f32e',
  accountPassword: 'user',
}
