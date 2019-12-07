# Sealer Node

The Sealer node consists of a minimal Backend, Frontend and a full Parity-Node, with which it will seal blocks on the PoA Blockchain and send cryptographic material to the `Ballot` for **Distributed Key Generation**.

**Important: the two sealer containers + the parity-node should be started from within `poa-blockchain/scripts/start-sealer.sh` and `poa-blockchain/scripts/dev-chain.sh`**

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
