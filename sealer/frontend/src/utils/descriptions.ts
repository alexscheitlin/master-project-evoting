export const stepDescriptions = {
  register: `Each sealer has an Ethereum account. This account consists of a public and private key. The public key represents the address of the holder within the network (also known as Wallet). In this step, each sealer will register it's wallet address with the authority.`,
  startup:
    'A sealer will act as a validator on the Proof of Authority (PoA) blockchain. In order to start the blockchain, each sealer will have to boot one parity node with the provided chain specification. All parity nodes run by the sealers will form the PoA blockchain.',
  config:
    'Take part in the distributed key generation for the e-Voting system. By clicking the button below a key pair will be generated, consisting of a public and private share. The public share will be submitted to the Ballot Smart Contract. The combination of the public key shares will form the final public key of the sytem.',
  voting:
    'In the voting phase, the sealer node is passive. It will wait until the Voting Authority closes the vote. During this period, the parity nodes of the sealers is validating transactions on the PoA network.',
  tally:
    'To tally all votes, each sealer node will fetch all ciphers of the votes from the Ballot contract. The sealer will then homomorphically add the vote-ciphers and decrypt the sum, which will be referred to as a decrypted share.',
  result: 'The vote was tallied, the vote result is shown below.',
}
