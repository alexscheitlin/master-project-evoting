//@ts-ignore
const Ballot = artifacts.require('Ballot');
import { FFelGamal } from 'mp-crypto';
import { toSystemParams, toParamsWithPubKey } from './helper';
import { assert } from 'chai';

const { KeyGeneration } = FFelGamal;

//@ts-ignore
contract('SumProofVerifier.sol', () => {
  // this is a ETH address
  // is needed for creating a proof
  // this address is currently hardcoded
  // in the future, this would be set as the currently active wallet address
  const uniqueID = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  const testCases = [[23, 2], [23, 6], [23, 8]];

  // run 10 tests for each test case
  for (let i = 0; i < 10; i++) {
    for (const testCase of testCases) {
      it(`ZKP Sum Verification for (p: ${testCase[0]}, g: ${testCase[1]})`, async () => {
        const ballotContract = await Ballot.new();
        const p_: number = testCase[0];
        const q_: number = (p_ - 1) / 2;
        const g_: number = testCase[1];

        const systemWideParams: FFelGamal.SystemParameters = KeyGeneration.generateSystemParameters(p_, q_, g_);
        await ballotContract.setParameters([systemWideParams.p, systemWideParams.q, systemWideParams.g]);

        // Authority 1
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

        // Authority 2
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

        const systemParamsFromContract = await ballotContract.getParameters();
        const systemParams = toSystemParams(systemParamsFromContract);
        const publicKey = await ballotContract.getPublicKey();
        const systemParamsWithPubKey = toParamsWithPubKey(systemParamsFromContract, publicKey);

        const sum = Math.floor(Math.random() * ((p_ - 1) / 2 - 1)) + 1;

        const sumEnc = FFelGamal.Encryption.encrypt(sum, systemParamsWithPubKey);
        const privateKey = KeyGeneration.combinePrivateKeys(systemParams, [keyShareAuth1.sk_, keyShareAuth2.sk_]);
        const proof = FFelGamal.SumZKP.generateSumProof(sumEnc, systemParamsWithPubKey, privateKey, uniqueID);

        // const verifiedSumProof = FFelGamal.SumZKP.verifySumProof(sumEnc, proof, pk, uniqueID)
        const verifiedSumProof = await ballotContract.verifySum(
          sumEnc.a,
          sumEnc.b,
          proof.a1,
          proof.b1,
          proof.d,
          proof.f,
          uniqueID,
        );

        assert.isTrue(verifiedSumProof, 'Sum proof could not be verified by the contract');
      });
    }
  }
});
