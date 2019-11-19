/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
const path = require('path');

// this allows to use import from statements in tests
require('ts-node/register');

module.exports = {
  contracts_build_directory: path.join(__dirname, 'src/contracts'),
  networks: {
    parity: {
      host: 'localhost',
      port: 8540,
      gas: 6000000,
      gasPrize: 1,
      network_id: '8995',
      from: '0x004ec07d2329997267ec62b4166639513386f32e',
    },
    ganache: {
      host: 'localhost',
      port: 8545,
      gas: 6000000,
      gasPrize: 1,
      network_id: '*', // Match any network id
    },
  },
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      version: '0.5.0', // ex:  "0.4.20". (Default: Truffle's installed solc)
    },
  },
};
