# Master Project: eVoting
# Master Project - Blockchain Based eVoting

## What to do initially

`npm run lerna:install` to link packages in order for the husky hook to work

see https://github.com/alexscheitlin/master-project-sink/pull/30 for more details

## Modules

![modules](./assets/eVoting.svg)

## How to run everything

### Authority Backend

`cd voting-authority-backend`

`npm install`

`npm run serve:dev` to run Authority Backend on PORT **4001**

You might need to adjust your `.env` files

```
...
PORT=4001
```

### Access Provider Backend

`cd access-provider-backend`

`npm install`

`npm run serve:dev` to run Access Provider on PORT **4002**

Additionally add the following to your `.env` files, as the Access Provider backend will need to make a request to the Authority Backend.

```
...
PORT=4002
AUTH_BACKEND_URL=http://localhost:4001
CHAIN_URL:http://localhost:8545
```

### Local Dev Chain with Ganache

`cd contracts`

`npm install`

run `npm run ganache:dev` inside `/contracts`

this blockchain will run on PORT **8545**

### Voter Frontend

`cd voter-frontend`

`npm install`

run `npm run start` inside `/voter-frontend`

the frontend will run on PORT **3000**

### What happens with the Solidity contracts?

The contracts live inside `/contracts`. There, we can test them isolated with the truffle framework. With `npm run compile` all contracts will be compiled and a JSON representation of the contract will be put inside `/contracts/compiled` (e.g., `Ballot.json`).

These `JSON` objects contain important information to interface with the contract once it is deployed on a chain. Therefore we need these `JSON` objects in a few other projects.

1. Authority Backend needs 2 `JSON` files. This backend will deploy the `Ballot.sol` contract onto the chain. To do this, it needs the `JSON` files. If you recompile contracts within `/contracts` then you will have to replace `Ballot.json` and `ModuloMathLib.json` inside `voting-authority-backend/solidity/toDeploy` with the newer version.

2. Voter Frontend needs `Ballot.json`, replace `voter-frontend/src/contract-abis/Ballot.json` if you update any contracts

3. Admin Frontend: ...needed?
