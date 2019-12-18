//@ts-ignore
const Ballot = artifacts.require('./FiniteField/Ballot.sol')

import {assert} from 'chai'
import {FFelGamal} from 'mp-crypto'
import BN from 'bn.js'
import {toSystemParams, toHex, unlockedAddresses} from '../helper'
import {fail} from 'assert'

//@ts-ignore
contract('Ballot.sol', () => {
  it('Ballot.sol e2e Test', async () => {
    // ganache-cli needs to be running with `npm run ganache:dev` such that the sender account is the same (for the verifiers)

    /**
     * 1. SETUP BUND
     *
     * Bund initialized the whole voting process by creating the system parameters, deploying the contract
     * and setting the parameters int the contract
     */
    const priviledgedAddresses = [unlockedAddresses.bund, unlockedAddresses.auth1, unlockedAddresses.auth2]
    const ballotContract = await Ballot.new('Is the dress blue or gold?', 2, priviledgedAddresses)
    const votingQuestion = await ballotContract.getVotingQuestion()
    assert(votingQuestion === 'Is the dress blue or gold?', 'voting question not correct')

    const p_ = 23
    const q_: number = (p_ - 1) / 2
    const g_ = 2

    const bund_systemParams: FFelGamal.SystemParameters = FFelGamal.SystemSetup.generateSystemParameters(p_, g_)
    await ballotContract.setParameters([bund_systemParams.p, bund_systemParams.q, bund_systemParams.g], {
      from: unlockedAddresses.bund,
    })

    /**
     * 2.1 SETUP AUTHORITY 1 (KANTON)
     *
     * generates and submits key shares + proof for generating the system wide public key
     */
    const auth1_sysParamsFromContract = await ballotContract.getParameters()
    const auth1_sysParams = toSystemParams(auth1_sysParamsFromContract)
    const auth1_keyShare: FFelGamal.KeyPair = FFelGamal.SystemSetup.generateKeyPair(auth1_sysParams)
    const auth1_uniqueID = unlockedAddresses.auth1
    const auth1_keyGenProof = FFelGamal.Proof.KeyGeneration.generate(auth1_sysParams, auth1_keyShare, auth1_uniqueID)
    await ballotContract.submitPublicKeyShare(auth1_keyShare.h, auth1_keyGenProof.c, auth1_keyGenProof.d, {
      from: unlockedAddresses.auth1,
    })

    /**
     * 2.2 SETUP AUTHORITY 2 (KANTON)
     *
     * generates and submits key shares + proof for generating the system wide public key
     */
    const auth2_sysParamsFromContract = await ballotContract.getParameters()
    const auth2_sysParams = toSystemParams(auth2_sysParamsFromContract)
    const auth2_keyShare: FFelGamal.KeyPair = FFelGamal.SystemSetup.generateKeyPair(auth2_sysParams)
    const auth2_uniqueID = unlockedAddresses.auth2
    const auth2_keyGenProof = FFelGamal.Proof.KeyGeneration.generate(auth2_sysParams, auth2_keyShare, auth2_uniqueID)
    await ballotContract.submitPublicKeyShare(auth2_keyShare.h, auth2_keyGenProof.c, auth2_keyGenProof.d, {
      from: unlockedAddresses.auth2,
    })

    /**
     * 3. BUND triggers public key generation & verifiers in contract
     *
     * generatePublicKey() will also trigger verififier creation
     */
    await ballotContract.generatePublicKey()

    // assert the combined public key in contract is the same as if combined locally on one machine
    const test_localPubKey = FFelGamal.SystemSetup.combinePublicKeys(auth1_sysParams, [
      auth1_keyShare.h,
      auth2_keyShare.h,
    ])
    const test_contractPubKey = await ballotContract.getPublicKey()
    assert(toHex(test_localPubKey) === toHex(test_contractPubKey), 'PublicKey does not match after combining shares')

    // Bund opens the ballot
    await ballotContract.openBallot()

    /**
     * 4. VOTER/CLIENT
     *
     * 4.1 the voter gets the system parameters and the system public key
     * 4.2 the voter creates a vote + proof and submits it to the contract
     */

    const client_uniqueID = unlockedAddresses.client
    const client_uniqueID2 = unlockedAddresses.client2

    // Client/Voter queries the system parameters from the Ballot contract
    const client_sysParamsFromContract = await ballotContract.getParameters()

    // Client/Voter queries the public key
    const client_publicKey = await ballotContract.getPublicKey()

    // Client/Voter creates system params with publicKey
    const client_sysParams: FFelGamal.SystemParameters = toSystemParams(client_sysParamsFromContract)

    // generate and submit yesVote
    const yesVote = FFelGamal.Voting.generateYesVote(client_sysParams, client_publicKey)

    const yesProof = FFelGamal.Proof.Membership.generateYesProof(
      yesVote,
      client_sysParams,
      client_publicKey,
      client_uniqueID
    )

    // test that auth account is not allowed to vote
    try {
      await ballotContract.vote(
        [yesVote.a, yesVote.b],
        [yesProof.a0, yesProof.a1],
        [yesProof.b0, yesProof.b1],
        [yesProof.c0, yesProof.c1],
        [yesProof.f0, yesProof.f1],
        {from: unlockedAddresses.auth1}
      )
    } catch (error) {
      assert(error.reason === 'Address not allowed to vote.')
    }

    // vote normally with client account
    try {
      await ballotContract.vote(
        [yesVote.a, yesVote.b],
        [yesProof.a0, yesProof.a1],
        [yesProof.b0, yesProof.b1],
        [yesProof.c0, yesProof.c1],
        [yesProof.f0, yesProof.f1],
        {from: client_uniqueID}
      )
    } catch (error) {
      fail('client address should be able to vote')
    }

    // assert that contract saved the votes correctly
    let nrVotes = await ballotContract.getNumberOfVotes()
    assert(
      toHex(nrVotes) === toHex(new BN(1)),
      'Nr of votes in contract does not correspond to the number of votes submitted'
    )

    // generate and submit noVote
    const noVote = FFelGamal.Voting.generateNoVote(client_sysParams, client_publicKey)
    const noProof = FFelGamal.Proof.Membership.generateNoProof(
      noVote,
      client_sysParams,
      client_publicKey,
      client_uniqueID2
    )
    await ballotContract.vote(
      [noVote.a, noVote.b],
      [noProof.a0, noProof.a1],
      [noProof.b0, noProof.b1],
      [noProof.c0, noProof.c1],
      [noProof.f0, noProof.f1],
      {from: client_uniqueID2}
    )

    // assert that contract saved the votes correctly
    nrVotes = await ballotContract.getNumberOfVotes()
    assert(
      toHex(nrVotes) === toHex(new BN(2)),
      'Nr of votes in contract does not correspond to the number of votes submitted'
    )

    /**
     * 5. BUND CLOSES THE BALLOT
     */
    let status = await ballotContract.getBallotStatus()
    assert(status === 'VOTING', 'Ballot should still be open')
    await ballotContract.closeBallot()
    status = await ballotContract.getBallotStatus()
    assert(status === 'TALLY', 'Ballot was not closed')

    /**
     * 6.1 COUNTING OF THE VOTES BY AUTHORITY 1
     *
     * The Kanton queries all vote-ciphers and homomorphically adds them locally
     * The Kanton generates decrypted share
     * The Kanton then generates a proof for the sum
     *
     */
    const auth1_votes = []
    const auth1_votesCount = await ballotContract.getNumberOfVotes()

    for (let i = 0; i < auth1_votesCount.toNumber(); i++) {
      const vote = await ballotContract.getVote(i)
      const c: FFelGamal.Cipher = {
        a: vote[0],
        b: vote[1],
      }
      auth1_votes.push(c)
    }
    // homomorphically add votes
    const auth1_sumCipher = FFelGamal.Voting.addVotes(auth1_votes, auth1_sysParams)

    // create decrypted share
    const auth1_decryptedShare = FFelGamal.Encryption.decryptShare(auth1_sysParams, auth1_sumCipher, auth1_keyShare.sk)

    // create proof for homomorphic sum
    const auth1_decryptedShareProof: FFelGamal.Proof.DecryptionProof = FFelGamal.Proof.Decryption.generate(
      auth1_sumCipher,
      auth1_sysParams,
      auth1_keyShare.sk,
      auth1_uniqueID
    )

    const auth1_isDecryptedShareProofValid = FFelGamal.Proof.Decryption.verify(
      auth1_sumCipher,
      auth1_decryptedShareProof,
      auth1_sysParams,
      auth1_keyShare.h,
      auth1_uniqueID
    )

    assert.isTrue(auth1_isDecryptedShareProofValid, 'auth1_isDecryptedShareProofValid false')

    // submit decrypted share to the contract with a proof
    await ballotContract.submitDecryptedShare(
      auth1_decryptedShare,
      auth1_sumCipher.a,
      auth1_sumCipher.b,
      auth1_decryptedShareProof.a1,
      auth1_decryptedShareProof.b1,
      auth1_decryptedShareProof.d,
      auth1_decryptedShareProof.f,
      {from: unlockedAddresses.auth1}
    )

    // assert correct number of shares are saved in the contract
    let nrOfSumShares = await ballotContract.getNrOfDecryptedShares()
    assert(toHex(nrOfSumShares) === toHex(new BN(1)), 'there should be 1 share in the contract')

    /**
     * 6.1 COUNTING OF THE VOTES BY AUTHORITY 2
     *
     * The Kanton queries all vote-ciphers and homomorphically adds them locally
     * The Kanton generates decrypted share
     * The Kanton then generates a proof for the sum
     *
     */
    const auth2_votes = []
    const auth2_votesCount = await ballotContract.getNumberOfVotes()

    for (let i = 0; i < auth2_votesCount.toNumber(); i++) {
      const vote = await ballotContract.getVote(i)
      const c: FFelGamal.Cipher = {
        a: vote[0],
        b: vote[1],
      }
      auth2_votes.push(c)
    }

    // homomorphically add votes
    const auth2_sumCipher = FFelGamal.Voting.addVotes(auth2_votes, auth2_sysParams)

    // create decrypted share
    const auth2_decryptedShare = FFelGamal.Encryption.decryptShare(auth2_sysParams, auth2_sumCipher, auth2_keyShare.sk)

    // create proof for homomorphic sum
    const auth2_decryptedShareProof: FFelGamal.Proof.DecryptionProof = FFelGamal.Proof.Decryption.generate(
      auth2_sumCipher,
      auth2_sysParams,
      auth2_keyShare.sk,
      auth2_uniqueID
    )

    const auth2_isDecryptedShareProofValid = FFelGamal.Proof.Decryption.verify(
      auth2_sumCipher,
      auth2_decryptedShareProof,
      auth2_sysParams,
      auth2_keyShare.h,
      auth2_uniqueID
    )

    assert.isTrue(auth2_isDecryptedShareProofValid, 'auth2_isDecryptedShareProofValid false')

    // submit decrypted share to the contract with a proof
    await ballotContract.submitDecryptedShare(
      auth2_decryptedShare,
      auth2_sumCipher.a,
      auth2_sumCipher.b,
      auth2_decryptedShareProof.a1,
      auth2_decryptedShareProof.b1,
      auth2_decryptedShareProof.d,
      auth2_decryptedShareProof.f,
      {from: unlockedAddresses.auth2}
    )

    // assert correct number of shares are saved in the contract
    nrOfSumShares = await ballotContract.getNrOfDecryptedShares()
    assert(toHex(nrOfSumShares) === toHex(new BN(2)), 'there should be 1 share in the contract')

    /**
     * 7. BUND - final voting result
     *
     * the Bund triggers combineDecryptedShares() in contract to compute
     * final result of the vote
     */
    await ballotContract.combineDecryptedShares()
    const finalResult = await ballotContract.getVoteResult()

    assert(toHex(finalResult) === toHex(new BN(1)), 'wrong voting result')
  })
})
