pragma solidity ^0.5.0;

contract VoteProofVerifier {

  struct Proof {
    uint[2] cipher; // a, b
    uint[2] a;
    uint[2] b;
    uint[2] c;
    uint[2] f;
  }

  struct PublicKey {
    uint p; // prime
    uint q; // prime factor: p = 2*q+1
    uint g; // generator
    uint h;
  }

  PublicKey publicKey;

  address constant UNIQUEID = 0x71C7656EC7ab88b098defB751B7401B5f6d8976F;


  constructor(uint p, uint q, uint g, uint h) public {
    publicKey = PublicKey(p, q, g, h);
  }

  function verifyProof(
    uint[2] memory cipher, // a, b
    uint[2] memory a,
    uint[2] memory b,
    uint[2] memory c,
    uint[2] memory f
    ) public view returns(bool) {

    // create a proof object
    // mostly needed because otherwise would throw compilation error that
    // stack depth is reached
    Proof memory proof = Proof(cipher, a, b, c, f);

    // verification g^f0 == a0*a^c0
    bool v1 = verifyV1(proof.a[0], proof.c[0], proof.f[0], proof.cipher[0]);

    // verification g^f1 == a1*a^c1
    bool v2 = verifyV2(proof.a[1], proof.f[1], proof.c[1], proof.cipher[0]);

    // verification h^f0 == b0 * b^c0
    bool v3 = verifyV3(proof.b[0], proof.c[0], proof.f[0], proof.cipher[1]);

    // verification h^f1 == b1 * (b/g)^c1
    bool v4 = verifyV4(proof.b[1], proof.c[1], proof.f[1], proof.cipher[1]);

    // recompute the hash and verify
    bool v5 = verifyV5(proof.a, proof.b, proof.c, proof.cipher);

    return v1 && v2 && v3 && v4 && v5;
  }

  function verifyV1(uint a0, uint c0, uint f0, uint cipher0) public view returns (bool) {
    uint l1 = pow(publicKey.g, f0);
    uint r1 = mul(a0, pow(cipher0, c0));
    return l1 == r1;
  }

  function verifyV2(uint a1, uint f1, uint c1, uint cipher0) public view returns (bool) {
    uint l2 = pow(publicKey.g, f1);
    uint r2 = mul(a1, pow(cipher0, c1));
    return l2 == r2;
  }

  function verifyV3(uint b0, uint c0, uint f0, uint cipher1) public view returns (bool) {
    uint l3 = pow(publicKey.h, f0);
    uint r3 = mul(b0, pow(cipher1, c0));
    return l3 == r3;
  }

  function verifyV4(uint b1, uint c1, uint f1, uint cipher1) public view returns (bool) {
    uint l4 = pow(publicKey.h, f1);
    uint r4 = mul(b1, pow(div(cipher1, publicKey.g), c1));
    return l4 == r4;
  }

  // verifies the challenge/hash
  function verifyV5(uint[2] memory a, uint[2] memory b, uint[2] memory c, uint[2] memory cipher) public view returns (bool) {
    // use the address of the sender once the verification call comes from the frontend
    // address of the caller provides a unique nonce for the hash
    // address uniqueID = msg.sender;
    address uniqueID = UNIQUEID;

    uint256 lc = (c[1] + c[0]) % publicKey.q;
    bytes32 rc = keccak256(abi.encodePacked(uniqueID, cipher[0], cipher[1], a[0], b[0], a[1], b[1]));
    return lc == (uint(rc) % publicKey.q);
  }

  //////////////////////////////////////
  // HELPER FUNCTIONS
  //////////////////////////////////////
      // modulo operations
  function add(uint a, uint b) public view returns (uint res){
    return (a + b) % publicKey.q;
  }

  function sub(uint a, uint b) public view returns (uint res){
    return (a - b) % publicKey.q;
  }

  function mul(uint a, uint b) public view returns (uint res){
    return (a * b) % publicKey.p;
  }

  function div(uint a, uint b) public view returns (uint res){
    return mul(a, invm(b, publicKey.p)) % publicKey.p;
  }

  function pow(uint a, uint b) public view returns (uint res){
    return (a**b) % publicKey.p;
  }

  /// @dev Modular inverse of a (mod p) using euclid.
  /// "a" and "p" must be co-prime.
  /// @param a The number.
  /// @param p The mmodulus.
  /// @return x such that ax = 1 (mod p)
  // inspired by: https://github.com/stonecoldpat/anonymousvoting/blob/master/LocalCrypto.sol
  function invm(uint a, uint p) public pure returns (uint res){
      if (a == 0 || a == p || p == 0)
          revert();
      if (a > p)
          a = a % p;
      int t1;
      int t2 = 1;
      uint r1 = p;
      uint r2 = a;
      uint q;
      while (r2 != 0) {
          q = r1 / r2;
          (t1, t2, r1, r2) = (t2, t1 - int(q) * t2, r2, r1 - q * r2);
      }
      if (t1 < 0)
          return (p - uint(-t1));
      return uint(t1);
  }
}