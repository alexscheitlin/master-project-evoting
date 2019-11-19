# Process

## General Process

0. Voter eIdentity Provisioning
1. Node Registration
2. Start network
3. Bund deploys Ballot.sol (with System Params)
4. Open Key Shares Generation Phase
5. Kantons generate Key Shares and publish their public share
6. Bund closes the key shares generation phase
7. Bund combines the public key shares
8. Bund opens voting phase (client can fetch public key)
9.  Votes take place
10. Bund closes voting phase
11. Bund opens decryption phase
12. Each kanton fetches all votes and computes the homomorphic sum
13. Each kanton decrypts the sum with its secret key share
14. Each kanton publishes the decrypted share with a respective proof
15. Bund closes decryption phase
16. The Bund calls a contract function to combine the decrypted shares

## Modules

### admin backend (bund)

- POST: `registerAuthority(string address)`
- POST: `openAuthorityRegistration()`
- `closeAuthorityRegistration()`
- GET `provideChainSpec()` with predefined validator addresses

### admin frontend (bund)

- deploy `Ballot.sol` with voting question
- `generateSystemParameters` -> generates and submits system parameters (p,q,g)
- `openVoting()` -> this allows the ballot contract to receive and store ballots. Before this period any received votes are dropped.
- `closeVoting()` -> this closes the vote and, therefore, no longer accepts any incoming ballots.
- `generateVotingSummary()` -> documents the outcome of a vote and generates a nice looking summary.

### authority scripts (kanton)

- `generateSealerAddress()`
- `submitSealerAddressToBund()`
- `connectToNetwork()`
- `generateKeyShare()` -> generates the public and private key shares for the Kanton
- `generateKeyShareProof()` -> generates a ZKP that proofs the secret key share knowledge to the public key share: `d = a^sk && g^sk = h`
- `publishPublicKeyShareToContract()`
- `storeKeyShareToFile()`
- `homomorphicallyAddVotes()` -> homomorphically adds all encrypted votes stored on the ballot contract
- `decryptSumWithSecretKeyShare()` -> decrypts the homomorphically produced sum using the before generated secret key share
- `generateDecryptionProof()` -> generates a ZKP that proofs the correct decryption of the sum (i.e. shows that the Kanton knows a secret key share to a public key share)
- `publishDecryptedShareAndProof()` -> publishes the decrypted share and the associated ZKP to the ballot contract. Once the last share has been received and successfully verified, the contract automatically combines the shares and reveals the result.

### identity provider

- `generateVoterTokens(validVoters)` -> `validVoterTokens[]`

### voter frontend

- `generateYesVote()`
- `generateNoVote()`
- `generateYesVoteProof()`
- `generateNoVoteProof()`
- `submitVoteAndProof()`

## Configuration

Descriptions of the different steps per participant.

### Bund

1. Make a sandwich so that you have enough energy for this fucking long list of todos
2. Generate list of valid voters
3. send list of valid voters to eIdentity provider (via eidentity backend)

### eIdentity provider

1. Generate a random token for each valid voter
2. Send list of all tokens to Bund (response on request of bund)

### Bund

1. Start Authority Registration Backend

### Kanton

0. Pull Parity Container and chain specs
1. Start Chain and generate account
2. Register sealer account via Registration Backend
3. Shut down chain

### Bund

1. Stop registration phase
2. Compile final chain spec with validators addresses
3. Provide final chain spec via registration backend

### Kanton

1. Fetch final chain spec via registration backend
2. Start node with engine_signer
3. Connect to bund node (with enode)

### Bund

1. open voting

### Voter

- authenticate voter via eIdentity Provider
- get voting token as result
- generate one-time wallet
- request eth from bund with voting token and wallet address (bund backend)

### Bund

1. close voting
2. start decryption phase

### Kanton

1. Homomorphically add vodes
2. decrypt share
3. generate proof
4. publish share with proof

### Bund

1. close voting
2. get shares and calculate final sum
3. publish result (via contract)
