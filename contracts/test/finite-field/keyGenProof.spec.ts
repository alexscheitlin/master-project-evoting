//@ts-ignore
const KeyGenProofVerifier = artifacts.require('./FiniteField/KeyGenProofVerifier')

import {FFelGamal} from 'mp-crypto'
import {unlockedAddresses} from '../helper'
import {assert} from 'chai'

//@ts-ignore
contract('KeyGenProofVerifier.sol', () => {
  const testCases = [
    [23, 2],
    [23, 6],
    [23, 8],
  ]

  // run 10 tests for each test case
  for (let i = 0; i < 10; i++) {
    for (const testCase of testCases) {
      it(`ZKP KeyGen Verification for (p: ${testCase[0]}, g: ${testCase[1]})`, async () => {
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

        const keyGenProofVerifier = await KeyGenProofVerifier.new()
        await keyGenProofVerifier.initialize(p_, q_, g_)

        const auth1_isKeyGenProofValidContract = await keyGenProofVerifier.verifyProof(
          auth1_keyGenProof.c,
          auth1_keyGenProof.d,
          auth1_keyShare.h,
          auth1_uniqueID
        )

        const auth2_isKeyGenProofValidContract = await keyGenProofVerifier.verifyProof(
          auth2_keyGenProof.c,
          auth2_keyGenProof.d,
          auth2_keyShare.h,
          auth2_uniqueID
        )

        assert.isTrue(auth1_isKeyGenProofValidContract, 'auth1_isKeyGenProofValidContract WRONG')
        assert.isTrue(auth2_isKeyGenProofValidContract, 'auth2_isKeyGenProofValidContract WRONG')
      })
    }
  }
})
