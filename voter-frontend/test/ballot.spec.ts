//@ts-ignore
const Ballot = artifacts.require('./Ballot.sol');

import { assert } from 'chai';
import { FFelGamal, Cipher } from 'mp-crypto';
import BN = require('bn.js');

const { KeyGeneration, Voting, VoteZKP, SumZKP } = FFelGamal;

const toHex = (bigNumber: BN) => {
  return bigNumber.toNumber().toString(16);
};

const toSystemParams = (params: BN[]) => {
  const systemParams: FFelGamal.SystemParameters = {
    p: params[0],
    q: params[1],
    g: params[2],
  };
  return systemParams;
};

const toParamsWithPubKey = (sysParams: BN[], pubKey: BN) => {
  const params: FFelGamal.PublicKey = {
    p: sysParams[0],
    q: sysParams[1],
    g: sysParams[2],
    h: pubKey,
  };
  return params;
};

//@ts-ignore
contract('Ballot.sol', () => {
  it('Ballot.sol e2e Test', async () => {
    /**
     * 1. SETUP BUND
     *
     * Bund initialized the whole voting process by creating the system parameters, deploying the contract
     * and setting the parameters int the contract
     */
    const ballotContract = await Ballot.deployed();
    const p_: number = 23;
    const q_: number = (p_ - 1) / 2;
    const g_: number = 2;

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
    const keyGenProofAuth_1 = KeyGeneration.generateKeyGenerationProof(systemParamsAuth1, keyShareAuth1, uniqueIdAuth1);
    await ballotContract.submitPublicKeyShare(keyShareAuth1.h_, keyGenProofAuth_1.d, keyGenProofAuth_1.d);

    // assert the correct numbers of key shares
    let nrOfShares = await ballotContract.getSharesLength();
    assert(toHex(nrOfShares) === toHex(new BN(1)), 'election.shares is not incremented properly');

    /**
     * 2.2 SETUP AUTHORITY 2 (KANTON)
     *
     * generates and submits key shares + proof for generating the system wide public key
     */
    const paramsInContractAuth2 = await ballotContract.getParameters();
    const systemParamsAuth2 = toSystemParams(paramsInContractAuth2);
    const keyShareAuth2: FFelGamal.KeyShare = KeyGeneration.generateKeyShares(systemParamsAuth2);
    const uniqueIdAuth2 = 'IamReallyUnique;-)';
    const keyGenProofAuth_2 = KeyGeneration.generateKeyGenerationProof(systemParamsAuth2, keyShareAuth2, uniqueIdAuth2);
    await ballotContract.submitPublicKeyShare(keyShareAuth2.h_, keyGenProofAuth_2.d, keyGenProofAuth_2.d);

    // assert the correct numbers of key shares
    nrOfShares = await ballotContract.getSharesLength();
    assert(toHex(nrOfShares) === toHex(new BN(2)), 'election.shares is not incremented properly');

    /**
     * 3. BUND triggers public key generation & verifiers in contract
     */
    await ballotContract.generatePublicKey();
    await ballotContract.createVerifiers();

    // assert the combined public key in contract is the same as if combined locally on one machine
    const localPubKey = KeyGeneration.combinePublicKeys(systemParamsAuth1, [keyShareAuth1.h_, keyShareAuth2.h_]);
    const contractPubKey = await ballotContract.getPublicKey();
    assert(toHex(localPubKey) === toHex(contractPubKey), 'PublicKey does not match after combining shares');

    // Bund opens the ballot
    await ballotContract.openBallot();

    /**
     * 4. VOTER/CLIENT
     *
     * 4.1 the voter gets the system parameters and the system public key
     * 4.2 the voter creates a vote + proof and submits it to the contract
     */

    // Client/Voter queries the system parameters from the Ballot contract
    const systemParamsClient = await ballotContract.getParameters();

    // Client/Voter queries the public key
    const publicKeyClient = await ballotContract.getPublicKey();

    // Client/Voter creates system params with publicKey
    const params: FFelGamal.PublicKey = toParamsWithPubKey(systemParamsClient, publicKeyClient);

    // ganache-cli needs to be running with `npm run ganache:dev` such that the sender account is the same (for the verifiers)
    const uniqueIDClient = '0x05f5E01f2D2073C8872Aca4213fD85F382CA681A';

    // generate and submit yesVote
    const yesVote = Voting.generateYesVote(params);
    const yesProof = VoteZKP.generateYesProof(yesVote, params, uniqueIDClient);
    await ballotContract.vote(
      [yesVote.a, yesVote.b],
      [yesProof.a0, yesProof.a1],
      [yesProof.b0, yesProof.b1],
      [yesProof.c0, yesProof.c1],
      [yesProof.f0, yesProof.f1],
      uniqueIDClient,
      { from: uniqueIDClient },
    );

    // assert that contract saved the votes correctly
    let nrVotes = await ballotContract.getNumberOfVotes();
    assert(
      toHex(nrVotes) === toHex(new BN(1)),
      'Nr of votes in contract does not correspond to the number of votes submitted',
    );

    // generate and submit noVote
    const noVote = Voting.generateNoVote(params);
    const noProof = VoteZKP.generateNoProof(noVote, params, uniqueIDClient);
    await ballotContract.vote(
      [noVote.a, noVote.b],
      [noProof.a0, noProof.a1],
      [noProof.b0, noProof.b1],
      [noProof.c0, noProof.c1],
      [noProof.f0, noProof.f1],
      uniqueIDClient,
      { from: uniqueIDClient },
    );

    // assert that contract saved the votes correctly
    nrVotes = await ballotContract.getNumberOfVotes();
    assert(
      toHex(nrVotes) === toHex(new BN(2)),
      'Nr of votes in contract does not correspond to the number of votes submitted',
    );

    /**
     * 5. BUND CLOSES THE BALLOT
     */
    let isOpen = await ballotContract.getBallotStatus();
    assert(isOpen === true, 'Ballot should still be open');
    await ballotContract.closeBallot();
    isOpen = await ballotContract.getBallotStatus();
    assert(isOpen === false, 'Ballot was not closed');

    /**
     * 6. COUNTING OF THE VOTES BY BUND
     *
     * The bund queries all vote-ciphers and homomorphically adds them locally
     * The bund then writes the resulting new cipher into the contract for everyone to see
     * together with a proof.
     */
    const _votes = [];
    const _votesCount = await ballotContract.getNumberOfVotes();

    for (let i = 0; i < _votesCount.toNumber(); i++) {
      const vote = await ballotContract.getVote(i);
      const c: Cipher = {
        a: vote[0],
        b: vote[1],
      };
      _votes.push(c);
    }

    const bundParams = await ballotContract.getParameters();
    const bundPublicKey = await ballotContract.getPublicKey();
    const bundParamsWithPublicKey: FFelGamal.PublicKey = toParamsWithPubKey(bundParams, bundPublicKey);
    // FIXME: (*) cannot create a proof for this sum, as the bund does not have a private key share..
    // but if each authority creates the sum of votes and submits a proof, then the sums will never be the same,
    // as the counting in addVotes starts with a `generateNoVote`, and inside this function there is a
    // random value
    const bundSumCipher = Voting.addVotes(_votes, bundParamsWithPublicKey);

    /**
     * 7.1 AUTHORITY 1 (KANTON) decryption of the final sum
     *
     * gets sum cipher of votes from the Ballot contract
     * decrypts the homomorphic encrypted sum of votes with its private key share
     * generates a sum proof
     * submit decrypted share + sumproof
     */
    // FIXME: see fixme (*) above
    const decSumkeyShareAuth1 = KeyGeneration.decryptShare(systemParamsAuth1, bundSumCipher, keyShareAuth1.sk_);

    // TODO: which proof do we generate here? A sum proof? Right now I generate a proof for the sum with
    // the secret-key-share. It fails...because of the secret-key-share?
    const sumProofAuth1 = SumZKP.generateSumProof(
      bundSumCipher,
      bundParamsWithPublicKey,
      keyShareAuth1.sk_,
      uniqueIDClient,
    );
    // FIXME: This always returns false. Because of keyShareAuth1.sk_?
    const verifSumproof = SumZKP.verifySumProof(bundSumCipher, sumProofAuth1, bundParamsWithPublicKey, uniqueIDClient);

    // submit decrypted share to the contract with a proof
    await ballotContract.submitSumShare(
      decSumkeyShareAuth1,
      bundSumCipher.a,
      bundSumCipher.b,
      sumProofAuth1.a1,
      sumProofAuth1.b1,
      sumProofAuth1.d,
      sumProofAuth1.f,
      uniqueIDClient,
    );

    // assert correct number of shares are saved in the contract
    let nrOfSumShares = await ballotContract.getNrOfSumShares();
    assert(toHex(nrOfSumShares) === toHex(new BN(1)), 'there should be 1 share in the contract');

    /**
     * 7.2 AUTHORITY 2 (KANTON) decryption of the final sum
     *
     * gets sum cipher of votes from the Ballot contract
     * decrypts the homomorphic encrypted sum of votes with its private key share
     * generates a sum proof
     * submit decrypted share + sumproof
     */

    const decSumShareAuth2 = KeyGeneration.decryptShare(systemParamsAuth2, bundSumCipher, keyShareAuth2.sk_);

    // TODO: which proof do we generate here? A sum proof? Right now I generate a proof for the sum with
    // the secret-key-share. It fails...because of the secret-key-share?
    const sumProofAuth2 = SumZKP.generateSumProof(
      bundSumCipher,
      bundParamsWithPublicKey,
      keyShareAuth2.sk_,
      uniqueIDClient,
    );

    // FIXME: This always returns false. Because of keyShareAuth2.sk_?
    const verifSumproof2 = SumZKP.verifySumProof(bundSumCipher, sumProofAuth2, bundParamsWithPublicKey, uniqueIDClient);

    // submit decrypted share to the contract with a proof
    await ballotContract.submitSumShare(
      decSumShareAuth2,
      bundSumCipher.a,
      bundSumCipher.b,
      sumProofAuth2.a1,
      sumProofAuth2.b1,
      sumProofAuth2.d,
      sumProofAuth2.f,
      uniqueIDClient,
    );

    // assert correct number of shares are saved in the contract
    nrOfSumShares = await ballotContract.getNrOfSumShares();
    assert(toHex(nrOfSumShares) === toHex(new BN(2)), 'there should be 1 share in the contract');

    /**
     * 8. BUND computes the final sum
     *
     * the Bund gets all decrypted shares (can be done by anyone)
     * the Bund combines the decrypted shares and finds the final tally result
     */
    const sumShares = [];
    for (let i = 0; i < nrOfSumShares.toNumber(); i++) {
      const sumShare = await ballotContract.getSumShare(i);
      sumShares.push(sumShare);
    }

    // finish decryption by combining decrypted shares
    const nrOfYesVotes = KeyGeneration.combineDecryptedShares(systemParamsAuth2, bundSumCipher, [...sumShares]);
    assert(toHex(nrOfYesVotes) === toHex(new BN(1)), 'wrong voting result');
  });
});
