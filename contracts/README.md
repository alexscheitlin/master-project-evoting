# Solidity Contracts

This sub-project holds all Solidity smart contracts used in the e-Voting project. It handles the compilation and testing of contracts. This is done with the [Truffle Suite](https://www.trufflesuite.com/ 'Truffle Suite').

**Truffle:** A world class development environment, testing framework and asset pipeline for blockchains using the Ethereum Virtual Machine (EVM), aiming to make life as a developer easier.

**Ganache:** A personal blockchain for Ethereum development you can use to deploy contracts, develop your applications, and run tests. Running `npm run ganache:dev` will run the personal blockchain on PORT **8545**.

- contracts can be found in `contracts/`
- tests can be found in `test/`

## Compile Contracts

```bash
npm run compile
```

Run `npm run compile` to compile all contracts inside `contracts/` into `compiled/`.

The compiled contracts are `JSON` files which can be used to deploy the contract or to interface with the contract. The `npm run compile` command automatically distributes the `JSON` files into the other sub-projects that need them. Adjust the `distribute-contracts.sh` to change this.

## How to run Tests

**Run all Tests**

```bash
npm run test
```

All tests are located inside `test/` and can all be run at the same time with `npm run test`.

**Run single Tests**

**_Method 1_**

If you wish to only run a single test, then the property `.only` can be set on the `contracts`, e.g.,:

```js
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

then runt `npm run test`

**_Method 2_**

```bash
npm i -g truffle

truffle test test/nameOfTest.spec.ts
```

Install truffle globally with `npm i -g truffle`.

Then run `truffle test test/nameOfTest.spec.ts` to only run tests in this file.

## How to add new Contracts for Testing

1. Add contract to `/contracts`
2. Add the contract to the deploy script in `migrations/2_deploy_contracts.js` (same as the others)
3. Add a test file in `/test/nameOfTest.spec.ts`
4. Run your test with the commands specified above
