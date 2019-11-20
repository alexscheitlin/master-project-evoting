pragma solidity ^0.5.0;

contract SumProofVerifier {

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
    uint c = generateChallenge(proof.a, proof.b, proof.a1, proof.b1, id);

    // verification a^f == a1 * d^c
    uint l1 = pow(proof.a, proof.f);
    uint r1 = mul(proof.a1, pow(proof.d, c));
    bool v1 = l1 == r1;

    // verification g^f == b1 * h^c
    uint l2 = pow(publicKey.g, proof.f);
    uint r2 = mul(proof.b1, pow(pubKey, c));
    bool v2 = l2 == r2;

    return v1 && v2;
  }

  //////////////////////////////////////
  // HELPER FUNCTIONS
  //////////////////////////////////////
  function generateChallenge(uint a, uint b, uint a1, uint b1, address uniqueID) internal view returns(uint) {
    bytes32 h = keccak256(abi.encodePacked(uniqueID, a, b, a1, b1));
    return uint(h) % publicKey.q;
  }

  //////////////////////////////////////
  // MODULO HELPER FUNCTIONS
  //////////////////////////////////////
  function add(uint a, uint b) public view returns (uint res){
    return (a + b) % publicKey.q;
  }

  function mul(uint a, uint b) public view returns (uint res){
    return (a * b) % publicKey.p;
  }

  function pow(uint a, uint b) public view returns (uint res){
    return (a**b) % publicKey.p;
  }
}