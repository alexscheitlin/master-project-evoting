# Parity Node

As the parity node needs a chain-specification (`chain.json`), it cannot be booted together with the other containers.
During the setup process, the backend will register its wallet address with the authority backend.
_After_ all nodes have registered themselves with the authority, the `chain.json` can be downloaded and the parity node can be started using `./run.sh {SealerNr}`.

The frontend will give instructions on how to start the parity-node.

## How it works

Each sealer has a key file inside `poa-blockchain/keys`.
We assume that this key material was generated beforehand.

When running `./start-sealer.sh <sealer nr>`, the script will copy over the needed keys into `./backend/wallet` and create a `.env` file with the correct values belonging to that sealer nr.
It will then start the two containers with the `docker-compose.yml`, which reads env-variables from the `.env` file.

**When and where is the `chain.json` stored?**

Once all nodes have registered themselves with the authority, the chainspec is downloaded with a `GET` request to the `voting-authority-backend` on endpoint `/chainspec`.
The `sealer-backend` will store this file inside `./backend/src/chainspec`.
