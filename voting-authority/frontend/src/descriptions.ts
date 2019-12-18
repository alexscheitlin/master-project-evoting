export const stepDescriptions = {
  register: `Each sealer has an Ethereum account. This account consists of a public and private key. The public key represents the address of the holder within the network (also known as Wallet). In this step, each sealer will register it's wallet address with the authority.`,
  startup:
    'A sealer will act as a validator on the Proof of Authority (PoA) blockchain. In order to start the blockchain, each sealer will have to boot one parity node with the provided chain specification. All parity nodes run by the sealers will form the PoA blockchain. Before a contract can be deployed, each sealer will need to register with the Voting Authority.',
  config:
    'Each sealer will generate a public and private key share. The public share will be submitted to the Ballot Smart Contract. The combination of the public key shares will then form the final public key of the sytem. The Voting Authority will trigger the creation of the public key.',
  voting:
    'We are in the voting phase. The Voting Authority can decide when to close the vote, this will also trigger a state change in the Ballot Smart Contract. After the vote is closed, no more votes can be submitted.',
  tally:
    'To tally all votes, each sealer node will fetch all ciphers of the votes from the Ballot contract. The sealer will then homomorphically add the vote-ciphers and decrypt the sum, which will be referred to as a decrypted share. Once all decrypted shares are submitted, the Voting Authority can trigger the tallying of the final result in the Ballot Smart Contract.',
  result: 'The vote was tallied, the vote result is shown below.',
}
