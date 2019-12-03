export const config = {
  chainUrl: 'http://localhost:8545',
  authBackendUrl: {
    dev: 'http://localhost:4001',
    prod: 'http://localhost:4002',
  },
  accessProviderUrl: {
    dev: 'http://localhost:4002',
    prod: 'https://localhost:4002',
  },
  identityProviderUrl: {
    dev: 'http://localhost:4003',
    prod: 'https://localhost:4003',
  },
};
