pragma solidity ^0.5.0;

// Modulo math function used by the contracts in the eVoting system
library ModuloMathLib {
  
  function modAdd(uint a, uint b, uint modulus) public view returns (uint res){
    return (a + b) % modulus;
  }

  function modSub(uint a, uint b, uint modulus) public view returns (uint res){
    return (a - b) % modulus;
  }

  function modMul(uint a, uint b, uint modulus) public view returns (uint res){
    return (a * b) % modulus;
  }

  function modDiv(uint a, uint b, uint modulus) public view returns (uint res){
    return modMul(a, modInv(b, modulus), modulus);
  }

  function modPow(uint a, uint b, uint modulus) public view returns (uint res){
    return (a**b) % modulus;
  }

  /// @dev Modular inverse of a (mod p) using euclid.
  /// "a" and "p" must be co-prime.
  /// @param a The number.
  /// @param p The modulus.
  /// @return x such that ax = 1 (mod p)
  // inspired by: https://github.com/stonecoldpat/anonymousvoting/blob/master/LocalCrypto.sol
  function modInv(uint a, uint p) public pure returns (uint res){
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