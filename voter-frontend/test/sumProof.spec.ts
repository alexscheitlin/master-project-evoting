const SumProofVerifier = artifacts.require('SumProofVerifier');
const { FFelGamal } = require('mp-crypto');
const random = require('random');

// this is a ETH address
// is needed for creating a proof
// this address is currently hardcoded
// in the future, this would be set as the currently active wallet address
const uniqueID = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

const testCases = [[23, 2], [23, 6], [23, 8]];

contract('SumProofVerifier.sol', () => {
  // run 10 tests for each test case
  for (let i = 0; i < 10; i++) {
    for (const testCase of testCases) {
      it(`ZKP Sum Verification for (p: ${testCase[0]}, g: ${testCase[1]})`, async () => {
        const p = testCase[0];
        const g = testCase[1];
        let pk;
        let sk;
        try {
          [pk, sk] = FFelGamal.Encryption.generateKeys(p, g);
        } catch (error) {
          console.error(error);
        }

        // deploy contract and pass system parameters
        const verifierInstance = await SumProofVerifier.new(pk.p, pk.q, pk.g, pk.h);

        const sum = random.int(1, (p - 1) / 2 - 1);

        const sumEnc = FFelGamal.Encryption.encrypt(sum, pk);
        const proof = FFelGamal.SumZKP.generateSumProof(sumEnc, pk, sk, uniqueID);

        // const verifiedSumProof = FFelGamal.SumZKP.verifySumProof(sumEnc, proof, pk, uniqueID)
        const verifiedSumProof = await verifierInstance.verifyProof(
          sumEnc.a,
          sumEnc.b,
          proof.a1,
          proof.b1,
          proof.d,
          proof.f,
        );

        assert.isTrue(verifiedSumProof, 'Sum proof could not be verified by the contract');
      });
    }
  }
});
