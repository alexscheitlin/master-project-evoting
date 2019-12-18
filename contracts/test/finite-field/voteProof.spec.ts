//@ts-ignore
const VoteProofVerifier = artifacts.require('./FiniteField/VoteProofVerifier')

import {assert} from 'chai'
import {FFelGamal} from 'mp-crypto'
import {unlockedAddresses} from '../helper'
import BN = require('bn.js')

// @ts-ignore
contract('VoteProofVerifier.sol', () => {
  const testCases = [
    [7, 2],
    [11, 3],
    [23, 2],
    [23, 6],
    [23, 8],
  ]

  // run 10 tests for each test case
  for (let i = 0; i < 10; i++) {
    // create a test case for each pair of p,g values
    for (const testCase of testCases) {
      it(`Voting and ZKP Verification for (p: ${testCase[0]}, g: ${testCase[1]})`, async () => {
        const p_: number = testCase[0]
        const q_: number = (p_ - 1) / 2
        const g_: number = testCase[1]

        const systemWideParams: FFelGamal.SystemParameters = FFelGamal.SystemSetup.generateSystemParameters(p_, g_)

        // Authority 1
        const auth1_keyShare: FFelGamal.KeyPair = FFelGamal.SystemSetup.generateKeyPair(systemWideParams)
        const auth1_uniqueID = unlockedAddresses.auth1
        const auth1_keyGenProof = FFelGamal.Proof.KeyGeneration.generate(
          systemWideParams,
          auth1_keyShare,
          auth1_uniqueID
        )
        const auth1_isKeyGenProofValid = FFelGamal.Proof.KeyGeneration.verify(
          systemWideParams,
          auth1_keyGenProof,
          auth1_keyShare.h,
          auth1_uniqueID
        )

        assert.isTrue(auth1_isKeyGenProofValid, 'key generation proof is not valid')

        // Authority 2
        const auth2_keyShare: FFelGamal.KeyPair = FFelGamal.SystemSetup.generateKeyPair(systemWideParams)
        const auth2_uniqueID = unlockedAddresses.auth2
        const auth2_keyGenProof = FFelGamal.Proof.KeyGeneration.generate(
          systemWideParams,
          auth2_keyShare,
          auth2_uniqueID
        )
        const auth2_isKeyGenProofValid = FFelGamal.Proof.KeyGeneration.verify(
          systemWideParams,
          auth2_keyGenProof,
          auth2_keyShare.h,
          auth2_uniqueID
        )

        assert.isTrue(auth2_isKeyGenProofValid, 'key generation proof is not valid')

        const publicKey = FFelGamal.SystemSetup.combinePublicKeys(systemWideParams, [
          auth1_keyShare.h,
          auth2_keyShare.h,
        ])

        const voteProofVerifier = await VoteProofVerifier.new()
        await voteProofVerifier.initialize(p_, q_, g_, publicKey)

        // yes vote
        const yesVote = 1
        const yesEnc = FFelGamal.Encryption.encrypt(yesVote, systemWideParams, publicKey)
        const yesProof = FFelGamal.Proof.Membership.generateYesProof(
          yesEnc,
          systemWideParams,
          publicKey,
          unlockedAddresses.client
        )

        // verify
        const yesVoteVerified: boolean = await voteProofVerifier.verifyProof(
          [yesEnc.a, yesEnc.b],
          [yesProof.a0, yesProof.a1],
          [yesProof.b0, yesProof.b1],
          [yesProof.c0, yesProof.c1],
          [yesProof.f0, yesProof.f1],
          unlockedAddresses.client
        )

        assert.isTrue(yesVoteVerified, 'YES-Proof could not be verified by the contract')

        // no vote
        const noVote = 0
        const noEnc = FFelGamal.Encryption.encrypt(noVote, systemWideParams, publicKey)
        const noProof = FFelGamal.Proof.Membership.generateNoProof(
          noEnc,
          systemWideParams,
          publicKey,
          unlockedAddresses.client
        )

        // verify
        const noVoteVerified: boolean = await voteProofVerifier.verifyProof(
          [noEnc.a, noEnc.b],
          [noProof.a0, noProof.a1],
          [noProof.b0, noProof.b1],
          [noProof.c0, noProof.c1],
          [noProof.f0, noProof.f1],
          unlockedAddresses.client
        )

        assert.isTrue(noVoteVerified, 'NO-Proof could not be verified by the contract')
      })
    }
  }
})
