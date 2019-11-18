//@ts-ignore
const Ballot = artifacts.require('Ballot');

import { assert } from 'chai';
import { FFelGamal } from 'mp-crypto';
import { toSystemParams, toParamsWithPubKey } from './helper';

const { KeyGeneration } = FFelGamal;

// @ts-ignore
contract('VoteProofVerifier.sol', () => {
  // this is a ETH address
  // is needed for creating a proof
  // this address is currently hardcoded
  // in the future, this would be set as the currently active wallet address
  const defaultAccount = '0x05f5E01f2D2073C8872Aca4213fD85F382CA681A';

  const testCases = [[7, 2], [11, 3], [23, 2], [23, 6], [23, 8]];

  // run 10 tests for each test case
  for (let i = 0; i < 10; i++) {
    // create a test case for each pair of p,g values
    for (const testCase of testCases) {
      it(`Voting and ZKP Verification for (p: ${testCase[0]}, g: ${testCase[1]})`, async () => {
        const ballotContract = await Ballot.new();
        const p_: number = testCase[0];
        const q_: number = (p_ - 1) / 2;
        const g_: number = testCase[1];

        const systemWideParams: FFelGamal.SystemParameters = KeyGeneration.generateSystemParameters(p_, q_, g_);
        await ballotContract.setParameters([systemWideParams.p, systemWideParams.q, systemWideParams.g]);

        /**
         * 2.1 SETUP AUTHORITY 1 (KANTON)
         *
         * generates and submits key shares + proof for generating the system wide public key
         */
        const paramsInContractAuth1 = await ballotContract.getParameters();
        const systemParamsAuth1 = toSystemParams(paramsInContractAuth1);
        const keyShareAuth1: FFelGamal.KeyShare = KeyGeneration.generateKeyShares(systemParamsAuth1);
        const uniqueIdAuth1 = 'IamReallyUnique;-)';
        const keyGenProofAuth_1 = KeyGeneration.generateKeyGenerationProof(
          systemParamsAuth1,
          keyShareAuth1,
          uniqueIdAuth1,
        );
        await ballotContract.submitPublicKeyShare(keyShareAuth1.h_, keyGenProofAuth_1.d, keyGenProofAuth_1.d);

        /**
         * 2.2 SETUP AUTHORITY 2 (KANTON)
         *
         * generates and submits key shares + proof for generating the system wide public key
         */
        const paramsInContractAuth2 = await ballotContract.getParameters();
        const systemParamsAuth2 = toSystemParams(paramsInContractAuth2);
        const keyShareAuth2: FFelGamal.KeyShare = KeyGeneration.generateKeyShares(systemParamsAuth2);
        const uniqueIdAuth2 = 'IamReallyUnique;-)';
        const keyGenProofAuth_2 = KeyGeneration.generateKeyGenerationProof(
          systemParamsAuth2,
          keyShareAuth2,
          uniqueIdAuth2,
        );
        await ballotContract.submitPublicKeyShare(keyShareAuth2.h_, keyGenProofAuth_2.d, keyGenProofAuth_2.d);

        await ballotContract.generatePublicKey();
        await ballotContract.createVerifiers();
        await ballotContract.openBallot();

        const publicKey = await ballotContract.getPublicKey();
        const systemParams = await ballotContract.getParameters();

        const systemParamsWithPubKey = toParamsWithPubKey(systemParams, publicKey);

        // yes vote
        const yesVote = 1;
        const yesEnc = FFelGamal.Encryption.encrypt(yesVote, systemParamsWithPubKey);
        const yesProof = FFelGamal.VoteZKP.generateYesProof(yesEnc, systemParamsWithPubKey, defaultAccount);

        let yesVoteVerified: boolean = false;

        await ballotContract
          .vote(
            [yesEnc.a, yesEnc.b],
            [yesProof.a0, yesProof.a1],
            [yesProof.b0, yesProof.b1],
            [yesProof.c0, yesProof.c1],
            [yesProof.f0, yesProof.f1],
            defaultAccount,
          )
          .then(
            (res: any) => {
              for (let i = 0; i < res.logs.length; i++) {
                const log = res.logs[i];
                if (log.event === 'VoteStatusEvent' && log.args[1] === true) {
                  yesVoteVerified = true;
                  break;
                }
                if (log.event === 'VoteStatusEvent' && log.args[1] === false) {
                  console.log('reason', log.args.reason);
                  break;
                }
              }
            },
            (error: any) => console.log('something went wrong: ', error),
          );

        assert.isTrue(yesVoteVerified, 'YES-Proof could not be verified by the contract');

        // no vote
        const noVote = 0;
        const noEnc = FFelGamal.Encryption.encrypt(noVote, systemParamsWithPubKey);
        const noProof = FFelGamal.VoteZKP.generateNoProof(noEnc, systemParamsWithPubKey, defaultAccount);

        let noVoteVerified: boolean = false;

        await ballotContract
          .vote(
            [noEnc.a, noEnc.b],
            [noProof.a0, noProof.a1],
            [noProof.b0, noProof.b1],
            [noProof.c0, noProof.c1],
            [noProof.f0, noProof.f1],
            defaultAccount,
          )
          .then(
            (res: any) => {
              for (let i = 0; i < res.logs.length; i++) {
                const log = res.logs[i];
                if (log.event === 'VoteStatusEvent' && log.args[1] === true) {
                  noVoteVerified = true;
                  break;
                }
                if (log.event === 'VoteStatusEvent' && log.args[1] === false) {
                  console.log('reason', log.args.reason);
                  break;
                }
              }
            },
            (error: any) => console.log('something went wrong: ', error),
          );

        assert.isTrue(noVoteVerified, 'NO-Proof could not be verified by the contract');
      });
    }
  }
});
