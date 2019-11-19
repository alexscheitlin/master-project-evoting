//@ts-ignore
const Ballot = artifacts.require('./Ballot.sol');

import { assert } from 'chai';
import { FFelGamal, Cipher, SumProof } from 'mp-crypto';
import BN from 'bn.js';
import { toSystemParams, toParamsWithPubKey, toHex } from './helper';

const { KeyGeneration, Voting, VoteZKP, SumZKP } = FFelGamal;

//@ts-ignore
contract.only('Ballot.sol', () => {
  it('Ballot.sol e2e Test', async () => {
    // ganache-cli needs to be running with `npm run ganache:dev` such that the sender account is the same (for the verifiers)
    const address = '0x05f5e01f2d2073c8872aca4213fd85f382ca681a';

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

    const bund_systemParams: FFelGamal.SystemParameters = KeyGeneration.generateSystemParameters(p_, q_, g_);
    await ballotContract.setParameters([bund_systemParams.p, bund_systemParams.q, bund_systemParams.g]);

    /**
     * 2.1 SETUP AUTHORITY 1 (KANTON)
     *
     * generates and submits key shares + proof for generating the system wide public key
     */
    const auth1_sysParamsFromContract = await ballotContract.getParameters();
    const auth1_sysParams = toSystemParams(auth1_sysParamsFromContract);
    const auth1_keyShare: FFelGamal.KeyShare = KeyGeneration.generateKeyShares(auth1_sysParams);
    const auth1_uniqueID = address;
    const auth1_keyGenProof = KeyGeneration.generateKeyGenerationProof(auth1_sysParams, auth1_keyShare, auth1_uniqueID);
    await ballotContract.submitPublicKeyShare(auth1_keyShare.h_, auth1_keyGenProof.d, auth1_keyGenProof.d);

    // assert the correct numbers of key shares
    let nrOfShares = await ballotContract.getPublicKeyShareLength();
    assert(toHex(nrOfShares) === toHex(new BN(1)), 'election.shares is not incremented properly');

    /**
     * 2.2 SETUP AUTHORITY 2 (KANTON)
     *
     * generates and submits key shares + proof for generating the system wide public key
     */
    const auth2_sysParamsFromContract = await ballotContract.getParameters();
    const auth2_sysParams = toSystemParams(auth2_sysParamsFromContract);
    const auth2_keyShare: FFelGamal.KeyShare = KeyGeneration.generateKeyShares(auth2_sysParams);
    const auth2_uniqueID = address;
    const auth2_keyGenProof = KeyGeneration.generateKeyGenerationProof(auth2_sysParams, auth2_keyShare, auth2_uniqueID);
    await ballotContract.submitPublicKeyShare(auth2_keyShare.h_, auth2_keyGenProof.d, auth2_keyGenProof.d);

    // assert the correct numbers of key shares
    nrOfShares = await ballotContract.getPublicKeyShareLength();
    assert(toHex(nrOfShares) === toHex(new BN(2)), 'election.shares is not incremented properly');

    /**
     * 3. BUND triggers public key generation & verifiers in contract
     */
    await ballotContract.generatePublicKey();
    await ballotContract.createVerifiers();

    // assert the combined public key in contract is the same as if combined locally on one machine
    const test_localPubKey = KeyGeneration.combinePublicKeys(auth1_sysParams, [auth1_keyShare.h_, auth2_keyShare.h_]);
    const test_contractPubKey = await ballotContract.getPublicKey();
    assert(toHex(test_localPubKey) === toHex(test_contractPubKey), 'PublicKey does not match after combining shares');

    // Bund opens the ballot
    await ballotContract.openBallot();

    /**
     * 4. VOTER/CLIENT
     *
     * 4.1 the voter gets the system parameters and the system public key
     * 4.2 the voter creates a vote + proof and submits it to the contract
     */

    const client_uniqueID = address;

    // Client/Voter queries the system parameters from the Ballot contract
    const client_sysParamsFromContract = await ballotContract.getParameters();

    // Client/Voter queries the public key
    const client_publicKey = await ballotContract.getPublicKey();

    // Client/Voter creates system params with publicKey
    const client_sysParamsWithPubKey: FFelGamal.PublicKey = toParamsWithPubKey(
      client_sysParamsFromContract,
      client_publicKey,
    );

    // generate and submit yesVote
    const yesVote = Voting.generateYesVote(client_sysParamsWithPubKey);
    const yesProof = VoteZKP.generateYesProof(yesVote, client_sysParamsWithPubKey, client_uniqueID);
    await ballotContract.vote(
      [yesVote.a, yesVote.b],
      [yesProof.a0, yesProof.a1],
      [yesProof.b0, yesProof.b1],
      [yesProof.c0, yesProof.c1],
      [yesProof.f0, yesProof.f1],
      client_uniqueID,
      { from: client_uniqueID },
    );

    // assert that contract saved the votes correctly
    let nrVotes = await ballotContract.getNumberOfVotes();
    assert(
      toHex(nrVotes) === toHex(new BN(1)),
      'Nr of votes in contract does not correspond to the number of votes submitted',
    );

    // generate and submit noVote
    const noVote = Voting.generateNoVote(client_sysParamsWithPubKey);
    const noProof = VoteZKP.generateNoProof(noVote, client_sysParamsWithPubKey, client_uniqueID);
    await ballotContract.vote(
      [noVote.a, noVote.b],
      [noProof.a0, noProof.a1],
      [noProof.b0, noProof.b1],
      [noProof.c0, noProof.c1],
      [noProof.f0, noProof.f1],
      client_uniqueID,
      { from: client_uniqueID },
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
     * 6.1 COUNTING OF THE VOTES BY AUTHORITY 1
     *
     * The Kanton queries all vote-ciphers and homomorphically adds them locally
     * The Kanton generates decrypted share
     * The Kanton then generates a proof for the sum
     *
     */
    const auth1_votes = [];
    const auth1_votesCount = await ballotContract.getNumberOfVotes();

    for (let i = 0; i < auth1_votesCount.toNumber(); i++) {
      const vote = await ballotContract.getVote(i);
      const c: Cipher = {
        a: vote[0],
        b: vote[1],
      };
      auth1_votes.push(c);
    }
    const auth1_sysParamsWithPubKey: FFelGamal.PublicKey = toParamsWithPubKey(
      auth1_sysParamsFromContract,
      auth1_keyShare.h_,
    );

    // homomorphically add votes
    const auth1_sumCipher = Voting.addVotes(auth1_votes, auth1_sysParamsWithPubKey);

    // create decrypted share
    const auth1_decryptedShare = KeyGeneration.decryptShare(auth1_sysParams, auth1_sumCipher, auth1_keyShare.sk_);

    // create proof for homomorphic sum
    const auth1_decryptedShareProof: SumProof = SumZKP.generateSumProof(
      auth1_sumCipher,
      auth1_sysParamsWithPubKey,
      auth1_keyShare.sk_,
      auth1_uniqueID,
    );

    // submit decrypted share to the contract with a proof
    await ballotContract.submitDecryptedShare(
      auth1_decryptedShare,
      auth1_sumCipher.a,
      auth1_sumCipher.b,
      auth1_decryptedShareProof.a1,
      auth1_decryptedShareProof.b1,
      auth1_decryptedShareProof.d,
      auth1_decryptedShareProof.f,
      auth1_uniqueID,
    );

    // assert correct number of shares are saved in the contract
    let nrOfSumShares = await ballotContract.getNrOfDecryptedShares();
    assert(toHex(nrOfSumShares) === toHex(new BN(1)), 'there should be 1 share in the contract');

    /**
     * 6.1 COUNTING OF THE VOTES BY AUTHORITY 2
     *
     * The Kanton queries all vote-ciphers and homomorphically adds them locally
     * The Kanton generates decrypted share
     * The Kanton then generates a proof for the sum
     *
     */
    const auth2_votes = [];
    const auth2_votesCount = await ballotContract.getNumberOfVotes();

    for (let i = 0; i < auth2_votesCount.toNumber(); i++) {
      const vote = await ballotContract.getVote(i);
      const c: Cipher = {
        a: vote[0],
        b: vote[1],
      };
      auth2_votes.push(c);
    }

    const auth2_paramsWithPublicKey: FFelGamal.PublicKey = toParamsWithPubKey(
      auth2_sysParamsFromContract,
      auth2_keyShare.h_,
    );

    // homomorphically add votes
    const auth2_sumCipher = Voting.addVotes(auth2_votes, auth2_paramsWithPublicKey);

    // create decrypted share
    const auth2_decryptedShare = KeyGeneration.decryptShare(auth2_sysParams, auth2_sumCipher, auth2_keyShare.sk_);

    // create proof for homomorphic sum
    const auth2_decryptedShareProof: SumProof = SumZKP.generateSumProof(
      auth2_sumCipher,
      auth2_paramsWithPublicKey,
      auth2_keyShare.sk_,
      auth2_uniqueID,
    );

    // submit decrypted share to the contract with a proof
    await ballotContract.submitDecryptedShare(
      auth2_decryptedShare,
      auth2_sumCipher.a,
      auth2_sumCipher.b,
      auth2_decryptedShareProof.a1,
      auth2_decryptedShareProof.b1,
      auth2_decryptedShareProof.d,
      auth2_decryptedShareProof.f,
      auth2_uniqueID,
    );

    // assert correct number of shares are saved in the contract
    nrOfSumShares = await ballotContract.getNrOfDecryptedShares();
    assert(toHex(nrOfSumShares) === toHex(new BN(2)), 'there should be 1 share in the contract');

    /**
     * 7. BUND - final voting result
     *
     * the Bund triggers combineDecryptedShares() in contract to compute
     * final result of the vote
     */
    await ballotContract.combineDecryptedShares();
    const finalResult = await ballotContract.getVoteResult();

    assert(toHex(finalResult) === toHex(new BN(1)), 'wrong voting result');
  });
});
