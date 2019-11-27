//@ts-ignore
const VoteProofVerifier = artifacts.require('./Elliptic/VoteProofVerifierEC');

import {assert} from 'chai';
import {ECelGamal} from 'mp-crypto';
import {unlockedAddresses} from '../helper';
import BN = require('bn.js');

// @ts-ignore
contract.only('VoteProofVerifierEC.sol', () => {
  it(`should run test with VoteProofVerifierEC`, async () => {
    const voteProofVerifier = await VoteProofVerifier.new();
    await voteProofVerifier.initialize(2, 2);
  });
});
