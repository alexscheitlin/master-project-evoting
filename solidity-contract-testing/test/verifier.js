const Verifier = artifacts.require('Verifier');

// dummy proof taken from a console.log of /crypto/src/zkp/index.ts
// used for testing
// these individual values are passed to the Verified contract
const proof = {
  pk: [
    '8e81a4b79ebab6d063730feba5bb4d943bb33185fd6d29a25a322a797757fd23',
    '50e9734783787d55abe859dbe32049aea0854a7434fc1e093aed90800adda40c'
  ],
  x: [
    '923d2f8219a8ccae7bf3c8d78c7ac06ebf1015e8b9ceed3d9fea5ee06433a958',
    '8c0205108df72117f16108e28d941f152cf781c9ffe7cd928a0058ab21d1a8a7'
  ],
  y: [
    'ed3449141ede3ef4acc2642217234add96682eaf9fe80835b720a5edaeea84ef',
    'cb402e6802f1b5af94b98b1b8ce4f1e8ff79f7fdeaad8d3376f897405a014349'
  ],
  a1: [
    'e2de2beaf1607c3c7cfac47494ed7399ae13fe8e7b1732fe88efe70c69026b63',
    '753a1f45b72b8ab3f1d8cf5e25e5bdce271948aa11cd4b39746f5565206c96ca'
  ],
  a2: [
    '52bcb7a683adacb2a904ac0bc865dc1c847e6307b57563792d6eb3dc82cf593d',
    '414af51c1327d52c56ff111060a6ce2423365300e9b093538e86d6329c534aec'
  ],
  b1: [
    '173a222d5847a2e515e5b3f39f025f5cfbaaa59c0381bc95dcbf1328f2738898',
    'a5b0826ba5abe7e2e719551f55d529b3578ed943389ac557b60cacf86f8f33e8'
  ],
  b2: [
    '571b1807ea06bd305a47d4c85156f3fd54ab6828069ef23db41320afd52e83dd',
    'cc8f5e67a7014b3c3475c6e81f8abe5c05de7690460a6988f0308d89cb3d61a7'
  ],
  d1: '38a07c56c6ad9e793270502cde77565f2bab15cb6f24cbea4e50106d6695febe',
  d2: '9c84c86d87da61a8f84a32c0a5074844bb63f21bd696dab38df55634498a405d',
  r1: 'cf15af657a90b50df9cdf1c43ef897c46fccafbfbbc81288d223e16fa4a4492a',
  r2: '25ce9cb1639fdb9c58d2e20d3b79bd524255df792b086dde7159f5f35add32fc',
  c: 'd52544c44e8800222aba82ed837e9ea3e70f07e745bba69ddc4566a1b0203f1b'
};

// article that explains how to pass 256uints to solidity functions
// https://ethereum.stackexchange.com/questions/63399/bytes32-uint256-conversion

contract('Verifier.sol tests', accounts => {
  const _x1 = web3.utils.toBN(proof.x[0]);
  const _x2 = web3.utils.toBN(proof.x[1]);

  const _y1 = web3.utils.toBN(proof.y[0]);
  const _y2 = web3.utils.toBN(proof.y[1]);

  const _a1_1 = web3.utils.toBN(proof.a1[0]);
  const _a1_2 = web3.utils.toBN(proof.a1[1]);

  const _a2_1 = web3.utils.toBN(proof.a2[0]);
  const _a2_2 = web3.utils.toBN(proof.a2[1]);

  const _b1_1 = web3.utils.toBN(proof.b1[0]);
  const _b1_2 = web3.utils.toBN(proof.b1[1]);

  const _b2_1 = web3.utils.toBN(proof.b2[0]);
  const _b2_2 = web3.utils.toBN(proof.b2[1]);

  const _d1 = web3.utils.toBN(proof.d1);
  const _d2 = web3.utils.toBN(proof.d2);

  const _r1 = web3.utils.toBN(proof.r1);
  const _r2 = web3.utils.toBN(proof.r2);

  const _c = web3.utils.toBN(proof.c);

  it('Proof can be verified on the blockchain', async () => {
    const verifierInstance = await Verifier.deployed();

    const res = await verifierInstance.verifyProof(
      [_x1, _x2],
      [_y1, _y2],
      [_a1_1, _a1_2],
      [_a2_1, _a2_2],
      [_b1_1, _b1_2],
      [_b2_1, _b2_2],
      _d1,
      _d2,
      _r1,
      _r2,
      _c
    );

    assert.isTrue(res, 'proof could not be verified by the contract');
  });
});
