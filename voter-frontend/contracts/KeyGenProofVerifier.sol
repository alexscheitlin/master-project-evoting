pragma solidity ^0.5.0;

import './ModuloMathLib.sol';

contract KeyGenProofVerifier {

  using ModuloMathLib for uint;

  struct Proof {
    uint c;
    uint d;
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
    uint[2] memory proof, // proof {c, d}
    uint h_, // public key share
    address id // msg sender
    ) public view returns(bool) {

    uint p = parameters.p;
    uint q = parameters.q;
    uint g = parameters.g;

    Proof memory _proof = Proof(proof[0], proof[1]);

    uint b = computeB(g, p, h_, _proof.d, _proof.c);

    // recompute the challenge c = hash(id, h_, b)
    uint challenge = generateChallenge(q, id, h_, b);
    bool hashCheck = _proof.c == challenge;

    // verify that: g^d == b * h_^c
    uint gPowd = g.modPow(_proof.d, p);
    uint bhPowC = b.modMul(h_.modPow(_proof.c, p), p);
    bool dCheck = gPowd == bhPowC;


    return hashCheck && dCheck;
  }

  function computeB(uint g, uint p, uint h_, uint d, uint c) private view returns(uint) {
    // recompute b = g^d/h_^c
    uint b_1 = g.modPow(d, p);
    uint b_2 = h_.modPow(c, p);
    uint b = b_1.modDiv(b_2, p);
    return b;
  }

  function generateChallenge(
    uint q, 
    address id, 
    uint h_, 
    uint b
    ) private view returns(uint) {

    bytes32 c = keccak256(abi.encodePacked(id, h_, b));
    return (uint(c) % q);
  }

}