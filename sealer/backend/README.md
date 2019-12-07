# Sealer Backend

This backend will be responsible for the following taks within the voting cycle:

- Register this sealers public-address (wallet) with the auth backend
- Subscribe to changes in the auth backend
- Once all sealer are registered -> get the new `chain.json` -> save inside `src/chainspec`
- Start the blockchain from `poa-blockchain/scripts/dev-chain.sh`
- Send RPC call to port 7010 to find other peers
- Get address of Ballot from auth backend
- Perform in the distributed key generation.
- Submit the generated key-share to the Ballot contract
- ...voting phase
- Tally the votes and submit decrypted share of the homomorphic sum to the Ballot.
