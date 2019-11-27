pragma solidity ^0.5.13;

import "./EllipticCurveLib.sol";

// Elliptic Curve math functions used by the contracts in the eVoting system
library MathEC {
    // TODO: adjust to new curve
    uint256 constant GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798; // generator
    uint256 constant GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8; // generator
    uint256 constant PP = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F; // modulus of curve
    uint256 constant AA = 0;
    uint256 constant BB = 7; // constant of curve

    function gx() public pure returns (uint256) {
        return GX;
    }

    function gy() public pure returns (uint256) {
        return GY;
    }

    function curveModulus() public pure returns (uint256) {
        return PP;
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
