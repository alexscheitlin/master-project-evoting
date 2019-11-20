pragma solidity ^0.5.0;

import './ModuloMath.sol';

contract SumProofVerifier {

  using ModuloMath for uint;

  struct Proof {
    uint a; // cipher
    uint b; // cipher
    uint a1;
    uint b1;
    uint d;
    uint f;
  }

  struct PublicKey {
    uint p; // prime
    uint q; // prime factor: p = 2*q+1
    uint g; // generator
    uint h;
  }

  PublicKey publicKey;

  constructor() public {
    publicKey = PublicKey(0,0,0,0);
  }

  function initialize(uint p, uint q, uint g, uint h) public payable {
    publicKey.p = p;
    publicKey.q = q;
    publicKey.g = g;
    publicKey.h = h;
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
    uint c = generateChallenge(proof.a, proof.b, proof.a1, proof.b1, id, publicKey.q);

    // verification a^f == a1 * d^c
    uint l1 = proof.a.modPow(proof.f, publicKey.p);
    uint r1 = proof.a1.modMul(proof.d.modPow(c, publicKey.p), publicKey.p);
    bool v1 = l1 == r1;

    // verification g^f == b1 * h^c
    uint l2 = publicKey.g.modPow(proof.f, publicKey.p);
    uint r2 = proof.b1.modMul( pubKey.modPow(c, publicKey.p), publicKey.p);
    bool v2 = l2 == r2;

    return v1 && v2;
  }

  function generateChallenge(uint a, uint b, uint a1, uint b1, address uniqueID, uint modulus) internal pure returns(uint) {
    bytes32 h = keccak256(abi.encodePacked(uniqueID, a, b, a1, b1));
    return uint(h) % modulus;
  }
}