# Process

- State: Voting is closed. All Votes have been cast and are verified to be valid.

## Configuration

Descriptions of the different functions per participant.

### Bund

1. Prefunded Ethereum Account

   - Bund owns the system contracts.
   - Bund can preconfigure the `genesis` block of the blockchain.

2. Bund Frontend, with the following functions:

   - `generateSystemParameters` -> generates and submits system parameters (p,q,g)
   - `generateVoting()` -> generates a new ballot contract with the specified voting question and submits it to the blockchain.
   - `openVoting()` -> this allows the ballot contract to receive and store ballots. Before this period any received votes are dropped.
   - `closeVoting()` -> this closes the vote and, therefore, no longer accepts any incoming ballots.
   - `homomorphicallyAddVotes()` -> homomorphically adds all encrypted votes stored on the ballot contract.
   - `generateVotingSummary()` -> documents the outcome of a vote and generates a nice looking summary.

### Kanton

1. Dockerized Parity Ethereum Authority Node:

   - What else does it need on this node/container?
   - `joinNetwork()` -> Kanton nodes need a function to be able to join the network. Maybe this can be done automtically. Maybe a script or a configuration.

2. Kanton Frontend, with the following functions:
   - `generateKeyShare()` -> generates the public and private key shares for the Kanton
   - `generateKeyShareProof()` -> generates a ZKP that proofs the secret key share knowledge to the public key share: `d = a^sk && g^sk = h`
   - `publishPublicKeyShareToContract()`
   - `storeKeyShareToFile()`
   - `homomorphicallyAddVotes()` -> homomorphically adds all encrypted votes stored on the ballot contract
   - `decryptSumWithSecretKeyShare()` -> decrypts the homomorphically produced sum using the before generated secret key share
   - `generateDecryptionProof()` -> generates a ZKP that proofs the correct decryption of the sum (i.e. shows that the Kanton knows a secret key share to a public key share)
   - `publishDecryptedShareAndProof()` -> publishes the decrypted share and the associated ZKP to the ballot contract. Once the last share has been received and successfully verified, the contract automatically combines the shares and reveals the result.

### Voter

1. Voter Frontend, with the following functions:

- `generateYesVote()`
- `generateNoVote()`
- `generateYesVoteProof()`
- `generateNoVoteProof()`
- `submitVoteAndProof()`
- `homomorphicallyAddVotes()` -> homomorphically adds all encrypted votes stored on the ballot contract and compares it with the published version.

### Ethereum Contracts

#### Ballot Contract

#### Finite-Field Verifier Contract

#### EC Verifier Contract
