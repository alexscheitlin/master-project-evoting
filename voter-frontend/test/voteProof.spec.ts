const VoteProofVerifier = artifacts.require('VoteProofVerifier');
const { FFelGamal } = require('mp-crypto');

// this is a ETH address
// is needed for creating a proof
// this address is currently hardcoded
// in the future, this would be set as the currently active wallet address
const uniqueID = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

const testCases = [[7, 2], [11, 3], [23, 2], [23, 6], [23, 8]];

contract('VoteProofVerifier.sol', () => {
  // run 10 tests for each test case
  for (let i = 0; i < 10; i++) {
    // create a test case for each pair of p,g values
    for (const testCase of testCases) {
      it(`ZKP Verification for (p: ${testCase[0]}, g: ${testCase[1]})`, async () => {
        let pk;
        try {
          pk = FFelGamal.Encryption.generateKeysZKP(testCase[0], testCase[1])[0];
        } catch (error) {
          console.error(error);
        }

        // deploy contract and pass system parameters
        const verifierInstance = await VoteProofVerifier.new(pk.p, pk.q, pk.g, pk.h);

        // yes vote
        const yesVote = 1;
        const yesEnc = FFelGamal.Encryption.encrypt(yesVote, pk);
        const yesProof = FFelGamal.VoteZKP.generateYesProof(yesEnc, pk, uniqueID);

        const yesVoteVerified = await verifierInstance.verifyProof(
          [yesEnc.a, yesEnc.b],
          [yesProof.a0, yesProof.a1],
          [yesProof.b0, yesProof.b1],
          [yesProof.c0, yesProof.c1],
          [yesProof.f0, yesProof.f1],
        );

        assert.isTrue(yesVoteVerified, 'YES-Proof could not be verified by the contract');

        // no vote
        const noVote = 0;
        const noEnc = FFelGamal.Encryption.encrypt(noVote, pk);
        const noProof = FFelGamal.VoteZKP.generateNoProof(noEnc, pk, uniqueID);

        const noVoteVerified = await verifierInstance.verifyProof(
          [noEnc.a, noEnc.b],
          [noProof.a0, noProof.a1],
          [noProof.b0, noProof.b1],
          [noProof.c0, noProof.c1],
          [noProof.f0, noProof.f1],
        );

        assert.isTrue(noVoteVerified, 'NO-Proof could not be verified by the contract');
      });
    }
  }
});
