pragma solidity ^0.5.0;

import './VoteProofVerifier.sol';
import './SumProofVerifier.sol';

contract Ballot {

	// CONSTANTS
	bool private IS_VOTING_OPEN;

	struct SystemParameters {
    uint p; // prime
    uint q; // prime factor: p = 2*q+1
    uint g; // generator
  }

	struct PublicKey {
		uint h;
	}

	struct Election {
		uint nrOfVoters;
		Voter[] voters;
		mapping(address => bool) hasVoted;
		string votingQuestion;
		SumProof sumProof;
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

	struct SumProof {
    uint a1;
    uint b1;
    uint d;
    uint f;
  }

	VoteProofVerifier voteVerifier;
	SumProofVerifier sumVerifier;
	SystemParameters systemParameters;
	PublicKey publicKey;
	Election election;

	constructor() public{
		voteVerifier = new VoteProofVerifier();
		sumVerifier = new SumProofVerifier();

		// initialize empty Election struct
		election.nrOfVoters = 0;
		election.voters.length = 0;
		election.votingQuestion = "REPLACEME";
		election.sumProof = SumProof(0,0,0,0);
	}

  function setParameters(uint[3] memory params) public {
      systemParameters = SystemParameters(params[0], params[1], params[2]);
  }

  function getParameters() public view returns (uint[3] memory) {
      return [systemParameters.p, systemParameters.q, systemParameters.g];
  }

	function setPublicKey(uint key) public {
			publicKey = PublicKey(key);
	}

	function getPublicKey() public view returns (uint) {
		return publicKey.h;
	}

	function createVerifiers() public {
		voteVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g, publicKey.h);
		sumVerifier.initialize(systemParameters.p, systemParameters.q, systemParameters.g, publicKey.h);
	}

	function vote(		
		uint[2] calldata cipher, // a, b
    uint[2] calldata a,
    uint[2] calldata b,
    uint[2] calldata c,
    uint[2] calldata f,
		address id) external returns (bool){

		if(!IS_VOTING_OPEN) {
			// TODO: emit Event
			return false;
		}

		if(!verifyVote(cipher, a, b, c, f, msg.sender)) {
			// TODO: emit Event
			return false;
		}

		VoteProof memory voteProof = VoteProof(a,b,c,f);
		Cipher memory _cipher = Cipher(cipher[0], cipher[1]);
		Voter memory voter = Voter({voterAddress : msg.sender, cipher : _cipher, voteProof : voteProof});

		election.voters.push(voter);
		election.nrOfVoters = election.nrOfVoters + 1;
		election.hasVoted[msg.sender] = true;

		return true;
	}

	function verifyVote(
		uint[2] memory cipher, // a, b
    uint[2] memory a,
    uint[2] memory b,
    uint[2] memory c,
    uint[2] memory f,
		address id
	) public view returns(bool) {
		return voteVerifier.verifyProof(cipher, a, b, c, f, id);
	}

	function verifySum(
		uint a,
		uint b, // a, b
		uint a1,
		uint b1,
		uint d,
		uint f,
		address id
	) public view returns(bool) {
		return sumVerifier.verifyProof(a, b, a1, b1, d, f, id);
	}
}
