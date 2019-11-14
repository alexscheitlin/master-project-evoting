pragma solidity ^0.5.0;

import './VoteProofVerifier.sol';

contract Ballot {

	struct SystemParameters {
    uint p; // prime
    uint q; // prime factor: p = 2*q+1
    uint g; // generator
  }

	struct PublicKey {
		uint h;
	}

	VoteProofVerifier voteVerifier;
	SystemParameters systemParameters;
	PublicKey publicKey;

	constructor() public{
		voteVerifier = new VoteProofVerifier();
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
}
