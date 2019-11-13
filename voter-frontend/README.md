# Parity PoA - Truffle - React - Typescript

### 1) Run Parity PoA Chain Locally

All you need is to run some `npm` scripts one after the other:

```bash
> npm run chain:reset # deletes existing blockchain from memory
> npm run chain:start:node0 # runs a default node without any accounts (we don't have any yet)
> npm run chain:createAccounts:node0 # creates validator account + user account on node0
> npm run chain:start:node1 # runs a default node without any accounts (we don't have any yet)
> npm run chain:createAccounts:node1 # creates validator account on node1
# now stop all running nodes

# start the PoA blockchain in two separate terminals
> npm run chain:validator:node0 # spin up full validator node
> npm run chain:validator:node1 # spin up full validator node
```

### 2) Compile and Migrate Contracts

```bash
npm run truffle:dev # cleans, compiles, migrates contracts and starts the client
```

This command includes multiple smaller commands, such as:

- `npm run truffle:deploy` - cleans, compiles and migrates contracts

- `npm run truffle:clean` - remove `src/contracts`

- `npm run truffle:compile` - compile contracts into `src/contracts`

- `npm run truffle:migrate` - migrates contracts in `src/contracts` onto the running chain

- `npm run truffle:test` - runs all tests

### 3) Start Client

If not already started above with the `npm run truffle:dev` command, then the client can be started with:

```bash
npm run start
```
