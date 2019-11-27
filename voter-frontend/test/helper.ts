import BN from 'bn.js';

import { FFelGamal } from 'mp-crypto';

export const toHex = (bigNumber: BN) => {
  return bigNumber.toNumber().toString(16);
};

export const toSystemParams = (params: BN[]) => {
  const systemParams: FFelGamal.SystemParameters = {
    p: params[0],
    q: params[1],
    g: params[2],
  };
  return systemParams;
};

// these are the first 4 addresses shown when starting ganache via npm run ganache:dev
export const unlockedAddresses = {
  bund: '0x05f5e01f2d2073c8872aca4213fd85f382ca681a', // owner of contracts
  client: '0xA5Dc6DF6DE43Ece449542808A2E0F8f566b5762b',
  auth1: '0x14e1Ab3be44A7B4397D3750Ffa71Ee30d58316a1',
  auth2: '0xaF87cfA812cA199f3118d3Fcb3D4B427Aa857cA2',
};
