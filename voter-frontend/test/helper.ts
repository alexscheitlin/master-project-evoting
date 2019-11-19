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

export const toParamsWithPubKey = (sysParams: BN[], pubKey: BN) => {
  const params: FFelGamal.PublicKey = {
    p: sysParams[0],
    q: sysParams[1],
    g: sysParams[2],
    h: pubKey,
  };
  return params;
};
