# Develop and Test Solidity Contracts

Developed with the Truffe framework: https://www.trufflesuite.com/docs/truffle/quickstart

## Commands

### Testing

```shell
$ truffle test ./test/SomeContract.sol # run the Solidity test
$ truffle test ./test/someContract.js # run the Javascript test
$ truffle test # run all tests
```

**Possible Assertions:** https://github.com/trufflesuite/truffle/blob/develop/packages/core/lib/testing/Assert.sol

**Compile**

```shell
$ truffle compile # compile contracts into /build/contracts
```

**Migrating Contracts with Truffle Develop**

```shell
$ truffle develop # starts a local blockchain with 10 accounts
```

Here you are inside the Truffle environment and commands can be run without the `truffle` in front of it.

So to migrate the contracts to the running blockchain:

```shell
> migrate # migrates contracts
```

## With Ganache

checkout https://www.trufflesuite.com/docs/truffle/quickstart

- as for now, it is not setup, but should be easy
