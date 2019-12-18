//@ts-ignore
const SumProofVerifier = artifacts.require('./FiniteField/SumProofVerifier')

import {FFelGamal} from 'mp-crypto'
import {unlockedAddresses} from '../helper'
import {assert} from 'chai'
import BN = require('bn.js')

//@ts-ignore
contract('SumProofVerifier.sol', () => {
  const testCases = [
    [23, 2],
    [23, 6],
    [23, 8],
  ]

  // run 10 tests for each test case
  for (let i = 0; i < 10; i++) {
    for (const testCase of testCases) {
      it(`ZKP Sum Verification for (p: ${testCase[0]}, g: ${testCase[1]})`, async () => {
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

        const sumProofContract = await SumProofVerifier.new()
        await sumProofContract.initialize(p_, q_, g_, publicKey)

        const sum = Math.floor(Math.random() * ((p_ - 1) / 2 - 1)) + 1
        const systemParamsWithPubKey = {
          p: new BN(p_),
          q: new BN(q_),
          g: new BN(g_),
          h: publicKey,
        }
        const sumEnc = FFelGamal.Encryption.encrypt(sum, systemWideParams, publicKey)

        const privateKey = FFelGamal.SystemSetup.combinePrivateKeys(systemWideParams, [
          auth1_keyShare.sk,
          auth2_keyShare.sk,
        ])

        const proof = FFelGamal.Proof.Decryption.generate(
          sumEnc,
          systemParamsWithPubKey,
          privateKey,
          unlockedAddresses.bund
        )

        const verifiedSumProof = await sumProofContract.verifyProof(
          sumEnc.a,
          sumEnc.b,
          proof.a1,
          proof.b1,
          proof.d,
          proof.f,
          unlockedAddresses.bund,
          publicKey
        )

        assert.isTrue(verifiedSumProof, 'Sum proof could not be verified by the contract')
      })
    }
  }
})
