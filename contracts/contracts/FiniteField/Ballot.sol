pragma solidity ^0.5.3;

import './VoteProofVerifier.sol';
import './SumProofVerifier.sol';
import './KeyGenProofVerifier.sol';
import './ModuloMathLib.sol';

contract Ballot {
    // /////////////////////////////////
    // libraries
    // /////////////////////////////////
    using ModuloMathLib for uint256;

    // /////////////////////////////////
    // structs
    // /////////////////////////////////
    enum VotingState {KEY_GENERATION, VOTING, TALLYING, RESULT}

    // parameters for the elgamal crypto system
    struct SystemParameters {
        uint256 p; // prime
        uint256 q; // prime factor: p = 2*q+1
        uint256 g; // generator
    }

    // represents one part of the public key (distributed key generation)
    // this struct also records a proof along with the public key share
    struct PublicKeyShare {
        uint256 share;
        KeyShareProof keyShareProof;
    }

    // represents the decryption of all vote-ciphers done by one sealer
    // each sealer will go through this process and submit it's share
    // their product will then form the final sum
    struct DecryptedShare {
        uint256 share;
        DecryptedShareProof decryptedShareProof;
    }

    struct Election {
        string votingQuestion;
        uint256 nrOfVoters;
        Voter[] voters;
        mapping(address => bool) hasVoted;
        mapping(address => PublicKeyShare) pubKeyShareMapping;
        address[] publicKeyShareWallet;
        mapping(address => DecryptedShare) decryptedShareMapping;
        address[] decryptedShareWallet;
        Cipher sumCipher;
        uint256 yesVotes;
    }

    struct Voter {
        address voterAddress;
        Cipher cipher;
        VoteProof voteProof;
    }

    struct Cipher {
        uint256 a;
        uint256 b;
    }

    struct VoteProof {
        uint256[2] a;
        uint256[2] b;
        uint256[2] c;
        uint256[2] f;
    }

    struct DecryptedShareProof {
        uint256 a1;
        uint256 b1;
        uint256 d;
        uint256 f;
    }

    struct KeyShareProof {
        uint256 c;
        uint256 d;
    }

    // /////////////////////////////////
    // events
    // /////////////////////////////////
    event VoteStatusEvent(address indexed from, bool success, string reason);
    event SystemStatusEvent(address indexed from, bool success, string reason);

    // /////////////////////////////////
    // function modifiers
    // - call internal functions
    // - otherwise Solidity would duplicate
    //   and inline the functions, which costs way more gas
    // /////////////////////////////////
    modifier onlyOwner {
        isOwner();
        _;
    }

    modifier onlyIfPubKeySet {
        isPubKeySet();
        _;
    }

    modifier onlyIfSysParamsSet {
        isSysParamsSet();
        _;
    }

    function isOwner() internal view {
        require(msg.sender == owner, 'Only owner can call this function.');
    }

    function isPubKeySet() internal view {
        require(IS_PUBKEY_SET == true, 'Public Key no set.');
    }

    function isSysParamsSet() internal view {
        require(IS_PARAMETERS_SET == true, 'System Parameters not set.');
    }

    // /////////////////////////////////
    // variables
    // /////////////////////////////////
    VotingState private votingState = VotingState.KEY_GENERATION;

    VoteProofVerifier private voteVerifier;
    SumProofVerifier private sumVerifier;
    KeyGenProofVerifier private keyGenProofVerifier;

    SystemParameters private systemParameters;
    uint256 private publicKey;
    Election private election;
    bool private IS_PARAMETERS_SET;
    bool private IS_PUBKEY_SET;

    address public owner = msg.sender;

    // array of addresses that are not allowed to vote (authority, sealers and access provider)
    address[] private priviledgedAddresses;

    // The number of PublicKeyShare needed to create the publicKey (# of authorities)
    uint256 private NR_OF_AUTHORITY_NODES;

    // /////////////////////////////////
    // constructor
    // /////////////////////////////////
    constructor(string memory votingQuestion, uint256 numberOfAuthNodes, address[] memory addresses) public {
        voteVerifier = new VoteProofVerifier();
        sumVerifier = new SumProofVerifier();
        keyGenProofVerifier = new KeyGenProofVerifier();
        election.votingQuestion = votingQuestion;
        priviledgedAddresses = addresses;
        NR_OF_AUTHORITY_NODES = numberOfAuthNodes;
    }

    // /////////////////////////////////////////
    // VOTING AUTHORITY core functions (owner)
    // /////////////////////////////////////////

    // set the parameters of the elgamal crypto system
    // can only be done by the owner (authority) and should
    // be set after contract deployment
    function setParameters(uint256[3] calldata params) external onlyOwner {
        require(!IS_PARAMETERS_SET, 'System parmeters already set!');
        systemParameters = SystemParameters(params[0], params[1], params[2]);
        keyGenProofVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g);
        IS_PARAMETERS_SET = true;
    }

    // generates the public key of the elgamal crypto system
    // - the public key is generated from all submitted public key shares by the sealer nodes
    // - their product forms the public key
    function generatePublicKey() external onlyOwner {
        // public key can only be generated once
        require(!IS_PUBKEY_SET, 'The public key is already set.');

        // every sealer needs to have published it's public key share
        require(
            election.publicKeyShareWallet.length == NR_OF_AUTHORITY_NODES,
            'Public key shares !== number of authorities.'
        );

        // set an initial key (here, we take the first)
        address firstSealerAddress = election.publicKeyShareWallet[0];
        uint256 key = election.pubKeyShareMapping[firstSealerAddress].share;

        // form the product of all public key shares
        for (uint256 i = 1; i < election.publicKeyShareWallet.length; i++) {
            address addr = election.publicKeyShareWallet[i];
            key = key.modMul(election.pubKeyShareMapping[addr].share, systemParameters.p);
        }

        // set the public key
        publicKey = key;

        IS_PUBKEY_SET = true;

        // trigger the creation of the verifiers (for proof verification)
        // they depend on the system parameters and public key, that's why
        // they are created only once the public key is set
        createVerifiers();
    }

    // create proof verifiers
    function createVerifiers() private onlyOwner onlyIfPubKeySet onlyIfSysParamsSet {
        voteVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g, publicKey);
        sumVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g, publicKey);
    }

    // open the Ballot and change into state VOTING
    function openBallot() public onlyOwner onlyIfPubKeySet onlyIfSysParamsSet {
        require(votingState == VotingState.KEY_GENERATION, 'Need state KEY_GENERATION.');
        votingState = VotingState.VOTING;
    }

    // close the Ballot and change into state TALLYING
    function closeBallot() public onlyOwner onlyIfPubKeySet onlyIfSysParamsSet {
        require(votingState == VotingState.VOTING, 'Need state VOTING.');

        votingState = VotingState.TALLYING;
    }

    // combine all submitted decrypted shares to find the final tally
    // each sealer has to first submit it's decrypted share
    // the product of all decrypted shares will form the final result (nr of yes-votes)
    function combineDecryptedShares() public {
        require(votingState == VotingState.TALLYING, 'Need state TALLYING.');
        require(election.decryptedShareWallet.length == NR_OF_AUTHORITY_NODES, 'Nr of shares !== nr of sealers.');

        // define starting value (here, we take the share of the first address)
        address firstSealerAddress = election.decryptedShareWallet[0];
        uint256 res = election.decryptedShareMapping[firstSealerAddress].share;

        // calculate the product of all decrypted shares
        for (uint256 i = 1; i < election.decryptedShareWallet.length; i++) {
            address addr = election.decryptedShareWallet[i];
            res = res.modMul(election.decryptedShareMapping[addr].share, systemParameters.p);
        }

        uint256 mh = election.sumCipher.b.modMul(res.modInv(systemParameters.p), systemParameters.p);

        // decode message
        uint256 m = 0;
        uint256 g = systemParameters.g;
        uint256 p = systemParameters.p;
        while ((g.modPow(m, p)) != mh) {
            // the homomorphic property will reveal how many yes-votes there are
            m = m + 1;
        }

        // set the result
        election.yesVotes = m;

        // move into the RESULT state
        votingState = VotingState.RESULT;
    }

    // /////////////////////////////////
    // SEALER core functions
    // /////////////////////////////////

    // submit the public key share from the distributed key generation
    function submitPublicKeyShare(uint256 key, uint256 proof_c, uint256 proof_d)
        external
        returns (bool, string memory)
    {
        // accept key shares only if state is KEY_GENERATION
        // and the public key does not yet exist
        require(votingState == VotingState.KEY_GENERATION, 'Need state KEY_GENERATION.');
        require(!IS_PUBKEY_SET, 'Public key shares can only be submitted if the public key is not yet set.');
        require(
            keyGenProofVerifier.verifyProof(proof_c, proof_d, key, msg.sender),
            'Key Generation Proof is not correct.'
        );

        // check if this address has already submitted a share
        bool sealerAlreadySubmitted = false;

        for (uint256 i; i < election.publicKeyShareWallet.length; i++) {
            if (election.publicKeyShareWallet[i] == msg.sender) {
                sealerAlreadySubmitted = true;
            }
        }

        PublicKeyShare memory publicKeyShare = PublicKeyShare(key, KeyShareProof(proof_c, proof_d));

        if (!sealerAlreadySubmitted) {
            // add sealer address to array
            election.publicKeyShareWallet.push(msg.sender);
        }

        // add or replace the share
        election.pubKeyShareMapping[msg.sender] = publicKeyShare;

        return (true, 'Key Generation Proof is valid.');
    }

    // submit the decrypted share (a decryption share of all vote-ciphers)
    function submitDecryptedShare(uint256 share, uint256 a, uint256 b, uint256 a1, uint256 b1, uint256 d, uint256 f)
        external
        returns (bool, string memory)
    {
        // only allow submission if in state
        require(votingState == VotingState.TALLYING, 'The contract needs to be in state: TALLYING.');

        // don't accept if proof verification fails
        uint256 publicKeyShare = election.pubKeyShareMapping[msg.sender].share;
        require(sumVerifier.verifyProof(a, b, a1, b1, d, f, msg.sender, publicKeyShare));

        // check if this address has already submitted a share
        bool sealerAlreadySubmitted = false;

        for (uint256 i; i < election.decryptedShareWallet.length; i++) {
            if (election.decryptedShareWallet[i] == msg.sender) {
                sealerAlreadySubmitted = true;
            }
        }

        DecryptedShare memory decryptedShare = DecryptedShare(share, DecryptedShareProof(a1, b1, d, f));

        if (!sealerAlreadySubmitted) {
            // add sealer address to array
            election.decryptedShareWallet.push(msg.sender);
        }

        // add or replace the share
        election.decryptedShareMapping[msg.sender] = decryptedShare;

        // store the cipher for later decryption
        election.sumCipher = Cipher(a, b);

        emit VoteStatusEvent(msg.sender, true, 'DecryptedShareProof accepted');
        return (true, 'Sumproof accepted');
    }

    // /////////////////////////////////
    // VOTER core functions
    // /////////////////////////////////

    // checks if the given address is allowed to vote
    // only addresses which are not found in the priviledged addresses array can vote
    function isVoter(address addr) private view returns (bool) {
        for (uint8 i = 0; i < priviledgedAddresses.length; i++) {
            if (priviledgedAddresses[i] == addr) {
                return false;
            }
        }
        return true;
    }

    function vote(
        uint256[2] calldata cipher,
        uint256[2] calldata a,
        uint256[2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata f
    ) external returns (bool, string memory) {
        require(votingState == VotingState.VOTING, 'Vote not open.');
        require(isVoter(msg.sender), 'Address not allowed to vote.');
        require(!election.hasVoted[msg.sender], 'Voter already voted.');
        require(voteVerifier.verifyProof(cipher, a, b, c, f, msg.sender), 'Vote Proof not accepted.');

        VoteProof memory voteProof = VoteProof(a, b, c, f);
        Cipher memory _cipher = Cipher(cipher[0], cipher[1]);
        Voter memory voter = Voter(msg.sender, _cipher, voteProof);

        // add Voter struct
        election.voters.push(voter);
        election.nrOfVoters += 1;
        election.hasVoted[msg.sender] = true;

        emit VoteStatusEvent(msg.sender, true, 'Vote was accepted');
        return (true, 'Vote was accepted');
    }

    // /////////////////////////////////
    // getters
    // /////////////////////////////////

    // get the voting question
    function getVotingQuestion() external view returns (string memory) {
        return election.votingQuestion;
    }

    // get system parameters
    function getParameters() external view onlyIfSysParamsSet returns (uint256[3] memory) {
        return [systemParameters.p, systemParameters.q, systemParameters.g];
    }

    // get the total number of public key shares
    function getNrOfPublicKeyShares() public view returns (uint256) {
        return election.publicKeyShareWallet.length;
    }

    // get combined public key of the system
    function getPublicKey() public view onlyIfPubKeySet returns (uint256) {
        return publicKey;
    }

    // get a vote cipher at a specific index
    function getVote(uint256 idx) public view returns (uint256, uint256) {
        return (election.voters[idx].cipher.a, election.voters[idx].cipher.b);
    }

    // get the total number of votes in election.voters
    function getNumberOfVotes() public view returns (uint256) {
        return election.voters.length;
    }

    // get the status of the vote
    function getBallotStatus() public view returns (string memory) {
        if (votingState == VotingState.KEY_GENERATION) {
            return 'KEY_GENERATION';
        }

        if (votingState == VotingState.VOTING) {
            return 'VOTING';
        }

        if (votingState == VotingState.TALLYING) {
            return 'TALLYING';
        }

        if (votingState == VotingState.RESULT) {
            return 'RESULT';
        }
    }

    // get the total number of decrypted shares
    function getNrOfDecryptedShares() public view returns (uint256) {
        return election.decryptedShareWallet.length;
    }

    // get a decrypted share at a specific index
    function getDecryptedShare(uint256 idx) public view returns (uint256) {
        address addr = election.decryptedShareWallet[idx];
        return election.decryptedShareMapping[addr].share;
    }

    // get vote result
    function getVoteResult() public view returns (uint256) {
        require(votingState == VotingState.RESULT, 'The contract needs to be in state: RESULT.');
        return election.yesVotes;
    }
}
