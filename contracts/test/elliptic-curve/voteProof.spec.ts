//@ts-ignore
const VoteProofVerifier = artifacts.require('./Elliptic/VoteProofVerifierEC')

import {assert} from 'chai'
import {unlockedAddresses} from '../helper'
import {ECelGamal} from '@meck93/evote-crypto'
import {curve} from 'elliptic'

// @ts-ignore
contract('VoteProofVerifierEC.sol', () => {
  xit(`should run test with VoteProofVerifierEC`, async () => {
    // FIXME: has problems somehow with the evote-crypto library

    const voteProofVerifier = await VoteProofVerifier.new()

    // system params
    const systemParams = ECelGamal.SystemSetup.generateSystemParameters()

    // create publicKey
    const keys = ECelGamal.SystemSetup.generateKeyPair()

    const keysPoint = keys.h as curve.short.ShortPoint

    // initialize Verifier with publicKey
    await voteProofVerifier.initialize(keysPoint.getX(), keysPoint.getY())

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

    const yesVote_a = yesVote.a as curve.short.ShortPoint
    const yesVote_b = yesVote.b as curve.short.ShortPoint
    const yesVoteProof_a0 = yesVoteProof.a0 as curve.short.ShortPoint
    const yesVoteProof_a1 = yesVoteProof.a1 as curve.short.ShortPoint
    const yesVoteProof_b0 = yesVoteProof.b0 as curve.short.ShortPoint
    const yesVoteProof_b1 = yesVoteProof.b1 as curve.short.ShortPoint

    // verify vote & proof on chain
    const verified = await voteProofVerifier.verifyProof(
      [yesVote_a.getX(), yesVote_a.getY()],
      [yesVote_b.getX(), yesVote_b.getY()],
      [yesVoteProof_a0.getX(), yesVoteProof_a0.getY()],
      [yesVoteProof_a1.getX(), yesVoteProof_a1.getY()],
      [yesVoteProof_b0.getX(), yesVoteProof_b0.getY()],
      [yesVoteProof_b1.getX(), yesVoteProof_b1.getY()],
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
