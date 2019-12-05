# Authority Node (Docker)

example: https://github.com/mukul13/docker-example

## Needed function

1. `getChainspec()`
2. `startNode(chainspec)`
3. `createSealerWallet()`
4. `shutdownNode()`
5. `registerSealerWalletWithAuthority()`
6. wait until all sealers submitted their wallet address to authority (`isPrevotingPhaseDone(): boolean`)
7. `getChainspec()`
8. `startNode(chainspec)`
9. `registerENode()`
10. ... authority deploys `Ballot` (GET `/deploy` -> returns address or undefined)
11. `crypto.generateKeyPair()`
12. `ballotContract.submitPublicKeyPair()`
13. VOTING PHASE IS OPEN until `ballotContract.isBallotOpen() === false`
14. `tallyVotes()`
    - `ballotContract.fetchVotes()` (just get the votes)
    - `homomorphicallyAddVotes()`
    - `createDecryptedShare()`
    - `createDecryptionProof()`
    - `ballotContract.submitDecryptedShare()`

# TODOs

- create one project for starting ONE sealer node
  - specify location of key in docker-compose.yml
- test dockerode

1. Sealer creates a KEY FILE (JSON)
2. Save key file and password somewhere
3. Start docker-compose.yml and specify where the key is
4. docker-cmpose will start backend and frontend
5. register the address with the auth backend (the one generated beforehand)
6. wait for some time...
7. get chainspec
8. backend starts parity node (copy keys, mount poa-node)
9. GET authority URL:PORT to send enode to
10. RPC call to register enode
