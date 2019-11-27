pragma solidity ^0.5.13;

import "./VoteProofVerifier.sol";
import "./SumProofVerifier.sol";
import "./KeyGenProofVerifier.sol";
import "./ModuloMathLib.sol";

contract Ballot {
    // /////////////////////////////////
    // libraries
    // /////////////////////////////////
    using ModuloMathLib for uint256;

    // /////////////////////////////////
    // structs
    // /////////////////////////////////
    struct SystemParameters {
        uint256 p; // prime
        uint256 q; // prime factor: p = 2*q+1
        uint256 g; // generator
    }

    struct PublicKey {
        uint256 h;
    }

    struct PublicKeyShare {
        uint256 share;
        KeyShareProof keyShareProof;
    }

    struct DecryptedShare {
        uint256 share;
        DecryptedShareProof decryptedShareProof;
    }

    struct Election {
        uint256 nrOfVoters;
        Voter[] voters;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) pubKeyShareMapping;
        string votingQuestion;
        Cipher sumCipher;
        PublicKeyShare[] publicKeyShares;
        DecryptedShare[] decryptedShares;
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
    // constants
    // /////////////////////////////////

    // The number of PublicKeyShare needed to create the publicKey (# of authorities)
    uint256 private constant NR_OF_AUTHORITY_NODES = 2;

    // /////////////////////////////////
    // events
    // /////////////////////////////////
    event VoteStatusEvent(address indexed from, bool success, string reason);
    event SystemStatusEvent(address indexed from, bool success, string reason);

    // /////////////////////////////////
    // variables
    // /////////////////////////////////
    VoteProofVerifier private voteVerifier;
    SumProofVerifier private sumVerifier;
    KeyGenProofVerifier private keyGenProofVerifier;

    SystemParameters private systemParameters;
    PublicKey private publicKey;
    Election private election;
    bool private IS_PARAMETERS_SET;
    bool private IS_VOTING_OPEN;
    bool private IS_PUBKEY_SET;
    address private _owner;

    // /////////////////////////////////
    // constructor
    // /////////////////////////////////
    constructor() public {
        voteVerifier = new VoteProofVerifier();
        sumVerifier = new SumProofVerifier();
        keyGenProofVerifier = new KeyGenProofVerifier();

        IS_PARAMETERS_SET = false;
        IS_VOTING_OPEN = false;
        IS_PUBKEY_SET = false;

        _owner = msg.sender;

        // initialize empty Election struct
        election.nrOfVoters = 0;
        election.voters.length = 0;
        election.votingQuestion = "REPLACEME";
        election.publicKeyShares.length = 0;
        election.decryptedShares.length = 0;
        election.yesVotes = 0;
    }

    // /////////////////////////////////
    // BUND core functions (owner)
    // /////////////////////////////////
    function setParameters(uint256[3] calldata params) external {
        require(msg.sender == _owner);
        require(!IS_PARAMETERS_SET);
        systemParameters = SystemParameters(params[0], params[1], params[2]);
        keyGenProofVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g);
        IS_PARAMETERS_SET = true;
    }

    function generatePublicKey() external {
        require(msg.sender == _owner);
        require(!IS_PUBKEY_SET);
        require(election.publicKeyShares.length > 0);
        require(NR_OF_AUTHORITY_NODES == election.publicKeyShares.length);

        uint256 key = election.publicKeyShares[0].share;

        // create the combines public key
        for (uint256 i = 1; i < election.publicKeyShares.length; i++) {
            key = key.modMul(election.publicKeyShares[i].share, systemParameters.p);
        }

        // set the public key
        publicKey = PublicKey(key);

        IS_PUBKEY_SET = true;
    }

    function createVerifiers() public {
        require(msg.sender == _owner);
        voteVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g, publicKey.h);
        sumVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g, publicKey.h);
    }

    function openBallot() public {
        require(msg.sender == _owner);

        IS_VOTING_OPEN = true;
    }

    function closeBallot() public {
        require(msg.sender == _owner);

        IS_VOTING_OPEN = false;
    }

    function combineDecryptedShares() public {
        require(election.decryptedShares.length == NR_OF_AUTHORITY_NODES);

        uint256 res = election.decryptedShares[0].share;

        for (uint256 i = 1; i < election.decryptedShares.length; i++) {
            res = res.modMul(election.decryptedShares[i].share, systemParameters.p);
        }

        uint256 mh = election.sumCipher.b.modMul(res.modInv(systemParameters.p), systemParameters.p);

        // decode message (** is power operator)
        uint256 m = 0;
        uint256 g = systemParameters.g;
        uint256 p = systemParameters.p;
        while ((g.modPow(m, p)) != mh) {
            m = m + 1;
        }

        election.yesVotes = m;
    }

    // /////////////////////////////////
    // KANTON core functions
    // /////////////////////////////////
    function submitPublicKeyShare(uint256 key, uint256 proof_c, uint256 proof_d)
        external
        returns (bool, string memory)
    {
        bool proofValid = keyGenProofVerifier.verifyProof(proof_c, proof_d, key, msg.sender);

        if (!proofValid) {
            emit SystemStatusEvent(msg.sender, false, "Key Generation Proof is not correct.");
            return (false, "Key Generation Proof is not correct.");
        }

        election.pubKeyShareMapping[msg.sender] = key;
        election.publicKeyShares.push(PublicKeyShare(key, KeyShareProof(proof_c, proof_d)));
        return (true, "Key Generation Proof is valid.");
    }

    function submitDecryptedShare(uint256 share, uint256 a, uint256 b, uint256 a1, uint256 b1, uint256 d, uint256 f)
        external
        returns (bool, string memory)
    {
        if (IS_VOTING_OPEN) {
            emit VoteStatusEvent(msg.sender, false, "Vote is still ongoing");
            return (false, "Vote is still ongoing");
        }

        uint256 publicKeyShare = election.pubKeyShareMapping[msg.sender];
        if (!sumVerifier.verifyProof(a, b, a1, b1, d, f, msg.sender, publicKeyShare)) {
            emit VoteStatusEvent(msg.sender, false, "Proof not correct");
            return (false, "Proof not correct");
        }

        DecryptedShareProof memory proof = DecryptedShareProof(a1, b1, d, f);
        election.decryptedShares.push(DecryptedShare(share, proof));

        // TODO: figure out how to do this properly, this is needed in
        // combineDecryptedShares, but it's not elegant if it's overwritten
        // each time some authority submits a decrypted share
        election.sumCipher = Cipher(a, b);

        emit VoteStatusEvent(msg.sender, true, "DecryptedShareProof accepted");
        return (true, "Sumproof accepted");
    }

    // /////////////////////////////////
    // VOTER core functions
    // /////////////////////////////////
    function vote(
        uint256[2] calldata cipher,
        uint256[2] calldata a,
        uint256[2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata f
    ) external returns (bool, string memory) {
        if (!IS_VOTING_OPEN) {
            emit VoteStatusEvent(msg.sender, false, "Vote not open");
            return (false, "Vote not open");
        }

        // TODO: Enable once system is ready
        // if(election.hasVoted[msg.sender]) {
        // 	emit VoteStatusEvent(msg.sender, false, "Voter already voted");
        // 	return (false, "Voter already voted");
        // }

        if (!voteVerifier.verifyProof(cipher, a, b, c, f, msg.sender)) {
            emit VoteStatusEvent(msg.sender, false, "Proof not correct");
            return (false, "Proof not correct");
        }

        VoteProof memory voteProof = VoteProof(a, b, c, f);
        Cipher memory _cipher = Cipher(cipher[0], cipher[1]);
        Voter memory voter = Voter(msg.sender, _cipher, voteProof);

        election.voters.push(voter);
        election.nrOfVoters += 1;
        election.hasVoted[msg.sender] = true;

        emit VoteStatusEvent(msg.sender, true, "Vote was accepted");
        return (true, "Vote was accepted");
    }

    // /////////////////////////////////
    // getters
    // /////////////////////////////////

    // get system parameters
    function getParameters() external view returns (uint256[3] memory) {
        require(IS_PARAMETERS_SET);
        return [systemParameters.p, systemParameters.q, systemParameters.g];
    }

    // get combined public key of the system
    function getPublicKey() public view returns (uint256) {
        require(IS_PUBKEY_SET, "Public Key of the System not yet set");
        return publicKey.h;
    }

    // get a vote cipher at a specific index
    function getVote(uint256 idx) public view returns (uint256, uint256) {
        return (election.voters[idx].cipher.a, election.voters[idx].cipher.b);
    }

    // get the total number of votes in election.voters
    function getNumberOfVotes() public view returns (uint256) {
        return election.voters.length;
    }

    // get the status of the ballot {open | closed}
    function getBallotStatus() public view returns (bool) {
        return IS_VOTING_OPEN;
    }

    // get the total number of decrypted shares
    function getNrOfDecryptedShares() public view returns (uint256) {
        return election.decryptedShares.length;
    }

    // get a decrypted share at a specific index
    function getDecryptedShare(uint256 idx) public view returns (uint256) {
        return election.decryptedShares[idx].share;
    }

    // get vote result
    function getVoteResult() public view returns (uint256) {
        require(!IS_VOTING_OPEN);

        return election.yesVotes;
    }
}
