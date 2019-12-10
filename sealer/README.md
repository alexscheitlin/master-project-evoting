# Sealer Node

The Sealer node consists of a minimal Backend, Frontend and a full Parity-Node, with which it will seal blocks on the PoA Blockchain and send cryptographic material to the `Ballot` for **Distributed Key Generation**.

## How to run

`./start-sealer.sh <sealer nr>` will start two docker containers (frontend + backend) specified in `docker-compose.yml`

```bash
# Sealer 0
# ---------------------
# Backend     port 4010
# Frontend    port 3010
# Parity-node port 7010*

# Sealer 1
# ---------------------
# Backend     port 4011
# Frontend    port 3011
# Parity-node port 7011*

# Sealer 2
# ---------------------
# Backend     port 4012
# Frontend    port 3012
# Parity-node port 7012*
```

**\*What about the Parity Node?**

As the parity node needs a chain-specification (`chain.json`), it cannot be booted together with the other two containers. During the setup process, the backend will register it's wallet with the authority backend. _After_ all nodes have registered themselves with the authority, the `chain.json` can be downloaded.

The frontend will give instructions on how to start the parity-node.

## How it works

Each sealer nr has according key files inside `poa-blockchain/keys`. We assume that this key material was generated beforehand.

When running `./start-sealer.sh <sealer nr>`, the script will copy over the needed keys into `./backend/wallet` and create a `.env` file with the correct values belonging to that sealer nr. It will then start the two containers with the `docker-compose.yml`, which reads env-variables from the `.env` file.

**When and where is the `chain.json` stored?**

Once all nodes have registered themselves with the authority, the chainspec is downloaded with a `GET` request to the `voting-authority-backend` on endpoint `/chainspec`. The `sealer-backend` will store this file inside `./backend/src/chainspec`.

## Docker Compose

The `./start-node <sealer nr>` script makes sure the correct ports are written to `.env` and passed to docker-compose (see ports above).

**Development**

_backend_:

- `./backend/src` is mounted as volume, meaning that changed to the code from the outside are also visible inside the container. This will trigger a rebuild as the container is tarted with `npm run serve:dev` (specified in `./backend/Dockerfile`)

_frontend_:

- `./frontend/src` is mounted as volume, meaning that changed to the code from the outside are also visible inside the container. This will trigger a rebuild as the container is tarted with `npm run start` (specified in `./frontend/Dockerfile`)

## General Workflow (subject to change)

The general steps to take are the following:

1. Sealer creates a KEY FILE (JSON) and stores it with the password - there are already some in `poa-blockchain/keys`
1. Start `poa-blockchain/scripts/start-sealer.sh 0` (will start backend and frontend of sealer 0).
1. **TODO** register the address with the auth backend (the one generated beforehand)
1. **TODO** wait for some time...
1. **TODO** get chainspec
1. Start parity nodes with `poa-blockchain/scripts/dev-chain.sh` (will start three sealer nodes, with `chain.json` taken from `/backend/src/chainspec`)
1. **TODO** Make RPC call to peer with other nodes. (basically send the enode)
1. **TODO** Wait for Authority to deploy the `Ballot.sol` and set the System Parameters.
1. **TODO** Get address of Ballot contract (GET on `/deploy` auth backend)
1. **TODO** `crypto.generateKeyPair()`
1. **TODO** `ballotContract.submitPublicKeyPair()`
1. VOTING PHASE...
1. **TODO** `tallyVotes()` (Once the VOTING PHASE is over)

   - `ballotContract.fetchVotes()` (just get the votes)
   - `homomorphicallyAddVotes()`
   - `createDecryptedShare()`
   - `createDecryptionProof()`
   - `ballotContract.submitDecryptedShare()`
