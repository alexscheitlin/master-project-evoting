# Master Project: eVoting

## What to do initially

`npm run lerna:install` to link packages in order for the husky hook to work

see https://github.com/alexscheitlin/master-project-sink/pull/30 for more details

## Prerequisites

The following must be installed on your machine in order to run the whole setup.

- Node 12+
- npm
- jq (see below)
- docker
- docker-compose

Install JQ (https://stedolan.github.io/jq/download/) to process JSON in the command-line:

```bash
# ubuntu
sudo apt-get install jq

# fedora
sudo dnf install jq
```

### Crypto Private Github Package

While the crypto library is a private npm package, you need to login to npm on your command line.
`npm login --registry=https://npm.pkg.github.com`

You will need a Github personal access token with `package:read, package:write` permission. Unlock this in your Github account.

#### Github Config JSON

If the file does not exist, create a JSON file in the top-level folder (`/github.json`) that has the following structure. Insert your personal values here.

```json
{
  "github": {
    "user": "",
    "email": "",
    "token": ""
  }
}
```

## Modules

![modules](./assets/eVoting.svg)

## How to run

Each subproject is configured to set and wire the PORTS automatically for every service that this subproject needs. For example: with `sealer/docker-start.sh`, the needed environment variables are fetched from `system.json` and written to `.env` files. These `.env` files are then used in `docker-compose.yml`.

Use `./docker-up.sh` and `./docker-down.sh` to start/stop all docker containers. This includes:

- one voting authority backend
- one voting authority frontend
- one identity provider backend
- one access provider backend
- three sealer/parity nodes

### Voting Authority

**Mode=Development (`localhost`)**

In development mode, the frontend and backend will run on `localhost` for a better DX.

```bash
cd voting-authority/backend
npm run serve:localhost

# backend will run on localhost:4001
```

```bash
cd voting-authority/frontend
npm run start:localhost

# frontend will run on localhost:3001
```

**Mode=Production (`docker`)**

In production mode, the frontend and backend will run in docker-containers in the network (`172.1.1.0/24`) `e-voting`. This network is automatically created in the run scripts if it does not exist yet.

```bash
docker network ls

NETWORK ID    NAME      DRIVER   SCOPE
019cded65b2a  e-voting  bridge   local
```

```bash
cd voting-authority
./docker-start.sh

# backend will run on 172.1.1.41:4001
# frontend will run on 172.1.1.31:4001
```

### Access Provider

**Mode=Development (`localhost`)**

In development mode, the backend will run on `localhost` for a better DX.

```bash
cd access-provider-backend/
npm run serve:localhost

# backend will run on localhost:4002
```

**Mode=Production (`docker`)**

In production mode, the backend will run in a docker-container in the network (`172.1.1.0/24`) `e-voting`. This network is automatically created in the run script if it does not exist yet.

```bash
docker network ls

NETWORK ID    NAME      DRIVER   SCOPE
019cded65b2a  e-voting  bridge   local
```

```bash
cd access-provider-backend/
./docker-start.sh

# backend will run on 172.1.1.42:4002
```

### Identity Provider

**Mode=Development (`localhost`)**

In development mode, the backend will run on `localhost` for a better DX.

```bash
cd identity-provider-backend/
npm run serve:localhost

# backend will run on localhost:4003
```

**Mode=Production (`docker`)**

In production mode, the backend will run in a docker-container in the network (`172.1.1.0/24`) `e-voting`. This network is automatically created in the run script if it does not exist yet.

```bash
docker network ls

NETWORK ID    NAME      DRIVER   SCOPE
019cded65b2a  e-voting  bridge   local
```

```bash
cd identity-provider-backend/
./docker-start.sh

# backend will run on 172.1.1.43:4003
```

### Sealer

**Mode=Development (`localhost`)**

In development mode, the frontend and backend will run on `localhost` for a better DX.

```bash
cd sealer/backend
npm run serve:localhost

# backend will run on localhost:4011
```

```bash
cd sealer/frontend
npm run start:localhost

# frontend will run on localhost:3011
```

**Mode=Production (`docker`)**

In production mode, the frontend and backend will run in docker-containers in the network (`172.1.1.0/24`) `e-voting`. This network is automatically created in the run scripts if it does not exist yet.

```bash
docker network ls

NETWORK ID    NAME      DRIVER   SCOPE
019cded65b2a  e-voting  bridge   local
```

```bash
cd sealer
./docker-start.sh <sealerNr>

# example
./docker-start.sh 1 # will create backend and frontend for sealer 1

# backend will run on 172.1.1.14[1-3]:401[1-3]
# frontend will run on 172.1.1.13[1-3]:301[1-3]
```

### Proof of Authority Blockchain

_Always runs dockerized_ ... so there is no distinction between development and production mode.

**Start 3 sealer nodes directly**

```bash
cd poa-blockchain/scripts
./dev-chain-parity-nodes.sh
```

all this script does, is call the following 3 times:

```bash
sealer/docker-start.sh <sealerNr>
```

the only thing that is different to starting all sealers on their own, is that `./dev-chain-parity-nodes.sh` will also connect the nodes for you directly

### Voter Frontend

TODO

### Solidity Contracts

```bash
npm run compile # compile contracts

npm run test # run tests in /test
```

The contracts live inside `/contracts`. There, we can test them isolated with the truffle framework. With `npm run compile` all contracts will be compiled and a JSON representation of the contract will be put inside `/contracts/compiled` (e.g., `Ballot.json`).

These `JSON` objects contain important information to interface with the contract once it is deployed on a chain.

The compiled contract `JSON` files will be automatically put into the folders that need them. Currently these are the follwing:

- `voting-authority-backend/solidity/toDeploy/`
- `voter-frontend/src/contract-abis/`
- `sealer/backend/src/contract-abis/`
