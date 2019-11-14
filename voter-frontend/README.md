# Voter Frontend & Solidity Testing

## How to run Voter Frontend

1. run `npm install`
2. run `npm run ganache:dev` to spin up a local dev chain. **The accounts are always the same, as the chain is started with a mnemonic**
3. run `npm run truffle:dev` to compile, migrate contracts and start the react frontend

## How to run Tests

**Run all Tests**

All tests are located inside `/test` and can all be run at the same time with `npm run truffle:test`.

**Run single Tests**

_Method 1_

If you wish to only run a single test, then the property `.only` can be set on the `contracts`, e.g.,:

```javascript
contract.only('VoteProofVerifier.sol', () => {
  ...
  const verifierInstance = await Ballot.new();
  await verifierInstance.setParameters([pk.p, pk.q, pk.g]);
  await verifierInstance.setPublicKey(pk.h);
  await verifierInstance.createVerifiers();
  ..

  assert.isTrue(someReturnValueFromContract, 'test failed');
}

```

_Method 2_

Install truffle globally with `npm i -g truffle`.

Then run `truffle test test/nameOfTest.spec.ts` to only run tests in this file.

## How to add new Contracts for Testing

1. Add contract to `/contracts`
2. Add the contract to the deploy script in `migrations/2_deploy_contracts.js` (same as the others)
3. Add a test file in `/test/nameOfTest.spec.ts`
4. Run your test with the commands specified above (`npm run truffle:test`)
