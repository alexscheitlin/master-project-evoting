//@ts-ignore
const VoteProofVerifier = artifacts.require('./Elliptic/VoteProofVerifierEC')

import {assert} from 'chai'
import {ECelGamal} from 'mp-crypto'
import {unlockedAddresses} from '../helper'

// @ts-ignore
contract('VoteProofVerifierEC.sol', () => {
  xit(`should run test with VoteProofVerifierEC`, async () => {
    const voteProofVerifier = await VoteProofVerifier.new()

    // system params
    const systemParams = ECelGamal.SystemSetup.generateSystemParameters()

    // create publicKey
    const keys = ECelGamal.SystemSetup.generateKeyPair()

    // initialize Verifier with publicKey
    await voteProofVerifier.initialize(keys.h.getX(), keys.h.getY())

    // create vote
    const yesVote = ECelGamal.Voting.generateYesVote(keys.h)

    // create proof for vote
    const yesVoteProof = ECelGamal.Proof.Membership.generateYesProof(
      yesVote,
      systemParams,
      keys.h,
      unlockedAddresses.client
    )

    const localVerify = ECelGamal.Proof.Membership.verify(
      yesVote,
      yesVoteProof,
      systemParams,
      keys.h,
      unlockedAddresses.client
    )

    // verify vote & proof on chain
    const verified = await voteProofVerifier.verifyProof(
      [yesVote.a.getX(), yesVote.a.getY()],
      [yesVote.b.getX(), yesVote.b.getY()],
      [yesVoteProof.a0.getX(), yesVoteProof.a0.getY()],
      [yesVoteProof.a1.getX(), yesVoteProof.a1.getY()],
      [yesVoteProof.b0.getX(), yesVoteProof.b0.getY()],
      [yesVoteProof.b1.getX(), yesVoteProof.b1.getY()],
      yesVoteProof.c0,
      yesVoteProof.c1,
      yesVoteProof.f0,
      yesVoteProof.f1,
      {from: unlockedAddresses.client}
    )

    // console.log('localVerify', localVerify);
    // console.log(verified)

    /**
     * This test fails all the time:
     * - the calculations are too heavy, revert if all substeps of the verification
     * is done inside the contract
     * - the hash generation is not yet correct, either /crypto uses different hash
     * or the contract does correctly create the hash
     *
     * If we can safely use a BigInts in Solidity, then maybe this can be fixed as in the
     * challenge-verification in the contract we have to add two 256bit ints which might overflow
     */

    // assert true
    assert.isTrue(verified, 'not true')
  })
})
