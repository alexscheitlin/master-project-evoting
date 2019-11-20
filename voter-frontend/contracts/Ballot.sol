pragma solidity ^0.5.0;

import './VoteProofVerifier.sol';
import './SumProofVerifier.sol';
import './ModuloMathLib.sol';

// TODO: remove id from call signatures, try to use msg.sender
// TODO: learn more about revert(), assert() and require(), their differences and when to use which keyword...

contract Ballot {

	using ModuloMathLib for uint;

	//////////////////////////////////////////
	// EVENTS
	//////////////////////////////////////////
	event VoteStatusEvent(address indexed from, bool success, string reason);
	event SystemStatusEvent(address indexed from, bool success, string reason);


	//////////////////////////////////////////
	// CONSTANTS
	//////////////////////////////////////////
	// The number of PublicKeyShare needed to create the publicKey (# of authorities)
	uint constant NR_OF_AUTHORITY_NODES = 2;


	//////////////////////////////////////////
	// STRUCTS
	//////////////////////////////////////////
	struct SystemParameters {
    uint p; // prime
    uint q; // prime factor: p = 2*q+1
    uint g; // generator
  }

	struct PublicKey {
		uint h;
	}

	struct PublicKeyShare {
		uint share;
		KeyShareProof keyShareProof;
	}

	struct DecryptedShare {
		uint share;
		DecryptedShareProof decryptedShareProof;
	}

	struct Election {
		uint nrOfVoters;
		Voter[] voters;
		mapping(address => bool) hasVoted;
		mapping(address => uint256) pubKeyShareMapping;
		string votingQuestion;
		Cipher sumCipher;
		PublicKeyShare[] publicKeyShares;
		DecryptedShare[] decryptedShares;
		uint yesVotes;
	}

	struct Voter {
		address voterAddress;
		Cipher cipher;
		VoteProof voteProof;
	}

	struct Cipher {
		uint a;
		uint b;
	}

	struct VoteProof {
    uint[2] a;
    uint[2] b;
    uint[2] c;
    uint[2] f;
  }

	struct DecryptedShareProof {
    uint a1;
    uint b1;
    uint d;
    uint f;
  }

	struct KeyShareProof {
		uint c;
		uint d;
	}

	VoteProofVerifier voteVerifier;
	SumProofVerifier sumVerifier;

	SystemParameters private systemParameters;
	PublicKey private publicKey;
	Election private election;
	bool private IS_PARAMETERS_SET;
	bool private IS_VOTING_OPEN;
	bool private IS_PUBKEY_SET;
	address private _owner;


	//////////////////////////////////////////
	// CONSTRUCTOR
	//////////////////////////////////////////
	constructor() public{
		voteVerifier = new VoteProofVerifier();
		sumVerifier = new SumProofVerifier();

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


	//////////////////////////////////////////
	// SYSTEM PARAMETERS
	//////////////////////////////////////////
  function setParameters(uint[3] calldata params) external {
			require(!IS_PARAMETERS_SET);
			require(msg.sender == _owner);
      systemParameters = SystemParameters(params[0], params[1], params[2]);
			IS_PARAMETERS_SET = true;
  }

  function getParameters() external view returns (uint[3] memory) {
			require(IS_PARAMETERS_SET);
      return [systemParameters.p, systemParameters.q, systemParameters.g];
  }


	//////////////////////////////////////////
	// SYSTEM WIDE PUBLIC KEY GENERATIOn
	//////////////////////////////////////////
	function submitPublicKeyShare(uint key, uint proof_c, uint proof_d) external returns (bool, string memory) {
		if(!verifyKeyShare()) {
			emit SystemStatusEvent(msg.sender, false, "Key Generation Proof is not correct.");
			return (false, "Key Generation Proof is not correct.");
		}
		election.pubKeyShareMapping[msg.sender] = key;
		election.publicKeyShares.push(PublicKeyShare(key, KeyShareProof(proof_c, proof_d)));
	}

		// checks if the proof for the submitted key share is correct
	function verifyKeyShare() private view returns (bool) {
		// TODO: implement proof verification 
		return true;
	}

	function getPublicKeyShareLength() public view returns(uint) {
		return election.publicKeyShares.length;
	}

	function generatePublicKey() external {
		require(msg.sender == _owner);
		require(!IS_PUBKEY_SET);
		require(election.publicKeyShares.length > 0);
		require(NR_OF_AUTHORITY_NODES == election.publicKeyShares.length);

		uint256 key = election.publicKeyShares[0].share;

		// create the combines public key
		for(uint256 i = 1; i< election.publicKeyShares.length; i++) {
			key = key.modMul(election.publicKeyShares[i].share, systemParameters.p);
		}

		// set the public key
		publicKey = PublicKey(key);

		IS_PUBKEY_SET = true;
	}

	function getPublicKey() public view returns (uint) {
		require(IS_PUBKEY_SET, "Public Key of the System not yet set");
		return publicKey.h;
	}


	//////////////////////////////////////////
	// VERIFIER CREATION
	//////////////////////////////////////////
	function createVerifiers() public {
		require(msg.sender == _owner);
		voteVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g, publicKey.h);
		sumVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g, publicKey.h);
	}


	//////////////////////////////////////////
	// VOTING
	//////////////////////////////////////////
	function vote(
		uint[2] calldata cipher, // a, b
    uint[2] calldata a,
    uint[2] calldata b,
    uint[2] calldata c,
    uint[2] calldata f
		) external returns(bool, string memory) {

		if(!IS_VOTING_OPEN) {
			emit VoteStatusEvent(msg.sender, false, "Vote not open");
			return (false, "Vote not open");
		}

		// TODO: Enable once system is ready
		// if(election.hasVoted[msg.sender]) {
		// 	emit VoteStatusEvent(msg.sender, false, "Voter already voted");
		// 	return (false, "Voter already voted");
		// }

		if(!verifyVote(cipher, a, b, c, f, msg.sender)) {
			emit VoteStatusEvent(msg.sender, false, "Proof not correct");
			return (false, "Proof not correct");
		}

		VoteProof memory voteProof = VoteProof(a,b,c,f);
		Cipher memory _cipher = Cipher(cipher[0], cipher[1]);
		Voter memory voter = Voter(msg.sender, _cipher, voteProof);

		election.voters.push(voter);
		election.nrOfVoters += 1;
		election.hasVoted[msg.sender] = true;

		emit VoteStatusEvent(msg.sender, true, "Vote was accepted");
		return (true, "Vote was accepted");
	}

	function verifyVote(
		uint[2] memory cipher, // a, b
    uint[2] memory a,
    uint[2] memory b,
    uint[2] memory c,
    uint[2] memory f,
		address id
	) private view returns(bool) {
		return voteVerifier.verifyProof(cipher, a, b, c, f, id);
	}

	function getVote(uint256 idx) public view returns(uint256, uint256) {
		return (election.voters[idx].cipher.a, election.voters[idx].cipher.b);
	}

	function getNumberOfVotes() public view returns(uint256) {
		return election.voters.length;
	}


	//////////////////////////////////////////
	// BALLOT open/close/getStatus
	//////////////////////////////////////////
	function openBallot() public {
		require(msg.sender == _owner);

		IS_VOTING_OPEN = true;
	}

	function closeBallot() public {
		require(msg.sender == _owner);

		IS_VOTING_OPEN = false;
	}

	function getBallotStatus() public view returns(bool) {
		return IS_VOTING_OPEN;
	}


	//////////////////////////////////////////
	// DECRYPTED SHARE OF THE SUM
	//////////////////////////////////////////
	function submitDecryptedShare(
		uint share,
		uint a,
		uint b,
		uint a1,
		uint b1,
		uint d,
		uint f) external returns(bool, string memory) {
		
		if(IS_VOTING_OPEN) {
			emit VoteStatusEvent(msg.sender, false, "Vote is still ongoing");
			return (false, "Vote is still ongoing");
		}

		if(!verifyStandardZKP(a, b, a1, b1, d, f, msg.sender)) {
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

	function getNrOfDecryptedShares() public view returns(uint) {
		return election.decryptedShares.length;
	}

	function getDecryptedShare(uint idx) public view returns(uint) {
		return election.decryptedShares[idx].share;
	}

	function verifyStandardZKP(
		uint a, // cipher
		uint b, // cipher
		uint a1,
		uint b1,
		uint d,
		uint f,
		address id
	) public view returns(bool) {
		uint256 publicKeyShare = election.pubKeyShareMapping[id];
		return sumVerifier.verifyProof(a, b, a1, b1, d, f, id, publicKeyShare);
	}

	function combineDecryptedShares() public {
		require(election.decryptedShares.length > 0);

		uint256 res = election.decryptedShares[0].share;

		for(uint i = 1; i < election.decryptedShares.length; i++) {
			res = res.modMul(election.decryptedShares[i].share, systemParameters.p);
		}

		uint256 mh = election.sumCipher.b.modMul(res.modInv(systemParameters.p) ,systemParameters.p);

		// decode message (** is power operator)
		uint256 m = 0;
		uint256 g = systemParameters.g;
		uint256 p = systemParameters.p;
		while( ( g.modPow(m, p) ) != mh ) {
			m = m + 1;
		}

		election.yesVotes = m;
	}

	function getVoteResult() public view returns (uint) {
		return election.yesVotes;
	}
}
