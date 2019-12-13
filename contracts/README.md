# Solidity Contracts

This projects handles all Soldity Smart Contract related thing such as testing and compiling the contracts.

This project also offers a **ganache-cli** dev chain. `npm run ganache:dev` will run the chain on PORT **8545**

## Set Up

### link mp-crypto first

```bash
cd crypto
npm run build
npm link
cd ../contracts
npm link mp-crypto
```

If something changed in `/crypto`, run `npm run build` inside `/crypto`

## Compile

Run `npm run compile` to compile all contracts inside `/contracts` into `/compiled`.

The compiled contracts are `JSON` files which can be used to deploy or to interface with the contract. The `npm run compile` command automatically distributes the `JSON` files. Adjust the `distribute-contracts.sh` to change this.

## How to run Tests

**Run all Tests**

All tests are located inside `/test` and can all be run at the same time with `npm run test`.

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
4. Run your test with the commands specified above
