const Ballot = artifacts.require('./Ballot.sol');
const assert = require('chai').assert;

contract('Ballot.sol', () => {
  it('should create a test Case', async () => {
    const instance = await Ballot.deployed();

    const res = await instance.test();

    assert.isTrue(res > 0, 'could not connect to contract');
  });
});
