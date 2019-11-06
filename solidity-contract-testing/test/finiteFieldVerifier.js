const FiniteFieldVerifier = artifacts.require('FiniteFieldVerifier');

// this public key is set in the constructor in the smart contract
// for testing purposes, the key is now set manually in the contract
// to ensure that the tests pass, these values must be the same as the
// values in the constructor of FiniteFieldVerifier.sol
const PublicKey = {
  p: '', // prime
  q: '', // prime factor: p = 2*q+1
  g: '', // generator
  h: ''
};

const cipher = {
  a: '',
  b: ''
};

const proof = {
  a0: '',
  a1: '',
  b0: '',
  b1: '',
  c0: '',
  c1: '',
  f0: '',
  f1: ''
};

contract('FiniteFieldVerifier.sol', () => {
  const _cipher0 = web3.utils.toBN(cipher.a);
  const _cipher1 = web3.utils.toBN(cipher.b);
  const _a0 = web3.utils.toBN(proof.a0);
  const _a1 = web3.utils.toBN(proof.a1);
  const _b0 = web3.utils.toBN(proof.b0);
  const _b1 = web3.utils.toBN(proof.b1);
  const _c0 = web3.utils.toBN(proof.c0);
  const _c1 = web3.utils.toBN(proof.c1);
  const _f0 = web3.utils.toBN(proof.f0);
  const _f1 = web3.utils.toBN(proof.f1);

  it('Finite Field ElGamal Proof can be verified on the blockchain', async () => {
    const verifierInstance = await FiniteFieldVerifier.deployed();

    const res = await verifierInstance.verifyProof(
      [_cipher0, _cipher1],
      [_a0, _a1],
      [_b0, _b1],
      [_c0, _c1],
      [_f0, _f1]
    );

    assert.isTrue(res, 'proof could not be verified by the contract');
  });
});
