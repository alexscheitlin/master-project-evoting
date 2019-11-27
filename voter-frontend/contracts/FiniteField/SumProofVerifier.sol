pragma solidity ^0.5.0;

import './ModuloMathLib.sol';

contract SumProofVerifier {

  using ModuloMathLib for uint;

  struct Proof {
    uint a; // cipher
    uint b; // cipher
    uint a1;
    uint b1;
    uint d;
    uint f;
  }

  struct Parameters {
    uint p; // prime
    uint q; // prime factor: p = 2*q+1
    uint g; // generator
    uint h;
  }

  Parameters parameters;

  constructor() public {
    parameters = Parameters(0,0,0,0);
  }

  function initialize(uint p, uint q, uint g, uint h) public payable {
    parameters.p = p;
    parameters.q = q;
    parameters.g = g;
    parameters.h = h;
  }

  function verifyProof(
      uint a,
      uint b, // a, b
      uint a1,
      uint b1,
      uint d,
      uint f,
      address id,
      uint pubKey
      ) public view returns(bool) {

    // create a proof object
    // mostly needed because otherwise would throw compilation error that
    // stack depth is reached
    Proof memory proof = Proof(a, b, a1, b1, d, f);

    // recompute the challenge
    uint c = generateChallenge(proof.a, proof.b, proof.a1, proof.b1, id, parameters.q);

    // verification a^f == a1 * d^c
    uint l1 = proof.a.modPow(proof.f, parameters.p);
    uint r1 = proof.a1.modMul(proof.d.modPow(c, parameters.p), parameters.p);
    bool v1 = l1 == r1;

    // verification g^f == b1 * h^c
    uint l2 = parameters.g.modPow(proof.f, parameters.p);
    uint r2 = proof.b1.modMul( pubKey.modPow(c, parameters.p), parameters.p);
    bool v2 = l2 == r2;

    return v1 && v2;
  }

  function generateChallenge(uint a, uint b, uint a1, uint b1, address uniqueID, uint modulus) private pure returns(uint) {
    bytes32 h = keccak256(abi.encodePacked(uniqueID, a, b, a1, b1));
    return uint(h) % modulus;
  }
}