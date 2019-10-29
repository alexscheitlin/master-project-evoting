const Verifier = artifacts.require('Verifier');

// article that explains how to pass 256uints to solidity functions
// https://ethereum.stackexchange.com/questions/63399/bytes32-uint256-conversion

contract('Verifier', accounts => {
  it('2 + 2 = 4', async () => {
    const verifierInstance = await Verifier.deployed();
    const res = await verifierInstance.verifyProof(2, 2, 4);
    assert.isTrue(res, 'not the same');
  });
});
