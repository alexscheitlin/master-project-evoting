const Verifier = artifacts.require('Verifier');

contract('Verifier', accounts => {
  it('2 + 2 = 4', async () => {
    const verifierInstance = await Verifier.deployed();
    const res = await verifierInstance.verifyProof(2, 2, 4);
    assert.isTrue(res, 'not the same');
  });
});
