pragma solidity ^0.5.3;

import './EllipticCurveLib.sol';

// Elliptic Curve math functions used by the contracts in the eVoting system
library MathEC {
    // curve25519-weier
    uint256 constant GX = 0x2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaad245a; // generator
    uint256 constant GY = 0x20ae19a1b8a086b4e01edd2c7748d14c923d4d7e6d7c61b229e9c5a27eced3d9; // generator
    uint256 constant PP = 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed; // modulus of curve
    uint256 constant AA = 0x2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa984914a144;
    uint256 constant BB = 0x7b425ed097b425ed097b425ed097b425ed097b425ed097b4260b5e9c7710c864; // constant of curve
    uint256 constant NN = 0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed; // for BN mod

    function gx() public pure returns (uint256) {
        return GX;
    }

    function gy() public pure returns (uint256) {
        return GY;
    }

    function curveModulus() public pure returns (uint256) {
        return PP;
    }

    function n() public pure returns (uint256) {
        return NN;
    }

    function isOnCurve(uint256 x_1, uint256 y_1) public pure returns (bool) {
        return EllipticCurveLib.isOnCurve(x_1, y_1, AA, BB, PP);
    }

    function ecAdd(uint256 x_1, uint256 y_1, uint256 x_2, uint256 y_2) public pure returns (uint256, uint256) {
        return EllipticCurveLib.ecAdd(x_1, y_1, x_2, y_2, AA, PP);
    }

    function ecMul(uint256 scalar, uint256 x_1, uint256 y_1) public pure returns (uint256, uint256) {
        return EllipticCurveLib.ecMul(scalar, x_1, y_1, AA, PP);
    }

    function ecInv(uint256 x, uint256 y) public pure returns (uint256, uint256) {
        return EllipticCurveLib.ecInv(x, y, PP);
    }

}
