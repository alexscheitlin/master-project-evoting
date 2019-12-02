pragma solidity ^0.5.13;

// Modulo math function used by the contracts in the eVoting system
library ModuloMathLib {
    function modAdd(uint256 a, uint256 b, uint256 modulus) public view returns (uint256 res) {
        return (a + b) % modulus;
    }

    function modSub(uint256 a, uint256 b, uint256 modulus) public view returns (uint256 res) {
        return (a - b) % modulus;
    }

    function modMul(uint256 a, uint256 b, uint256 modulus) public view returns (uint256 res) {
        return (a * b) % modulus;
    }

    function modDiv(uint256 a, uint256 b, uint256 modulus) public view returns (uint256 res) {
        return modMul(a, modInv(b, modulus), modulus);
    }

    function modPow(uint256 a, uint256 b, uint256 modulus) public view returns (uint256 res) {
        return (a**b) % modulus;
    }

    /// @dev Modular inverse of a (mod p) using euclid.
    /// "a" and "p" must be co-prime.
    /// @param a The number.
    /// @param p The modulus.
    /// @return x such that ax = 1 (mod p)
    // inspired by: https://github.com/stonecoldpat/anonymousvoting/blob/master/LocalCrypto.sol
    function modInv(uint256 a, uint256 p) public pure returns (uint256 res) {
        if (a == 0 || a == p || p == 0) revert();
        if (a > p) a = a % p;
        int256 t1;
        int256 t2 = 1;
        uint256 r1 = p;
        uint256 r2 = a;
        uint256 q;
        while (r2 != 0) {
            q = r1 / r2;
            (t1, t2, r1, r2) = (t2, t1 - int256(q) * t2, r2, r1 - q * r2);
        }
        if (t1 < 0) return (p - uint256(-t1));
        return uint256(t1);
    }
}
