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
