pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./EllipticCurve.sol";

contract Verifier is EllipticCurve {

    uint256 constant GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 constant GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 constant PP = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F; // modulus of curve
    uint256 constant AA = 0;
    uint256 constant BB = 7; // constant of curve
  
    struct Proof {
        uint256 x;
        uint256 y;
        uint256 a1;
        uint256 a2;
        uint256 b1;
        uint256 b2;
        uint256 d1;
        uint256 d2;
        uint256 r1;
        uint256 r2;
        uint256 challenge;
    }
    
    struct Point {
        uint256 c1;
        uint256 c2;
    }
  

    function derivePubKey(uint256 privKey) public pure returns(uint256 qx, uint256 qy) {
        (qx, qy) = ecMul(
          privKey,
          GX,
          GY,
          AA,
          PP 
        );
    }
    
    function verifyProof(
        // Point memory x,
        // Point memory y,
        // Point memory a1,
        // Point memory a2,
        // Point memory b1,
        // Point memory b2,
        uint256 d1, // BigNumber
        uint256 d2, // BigNumber
        // uint256 r1, // BigNumber
        // uint256 r2, // BigNumber
        uint256 challenge // BigNumber
        ) public pure returns (bool b) {
        
    // 1. Step
    // Check if received hash can be recreated and is the same 
    // validation of the hash - digest == hash(challenge)
    uint256 d1d2 = (d1 + d2) % PP;
    bool isChallengeVerified = d1d2 == challenge;

    return isChallengeVerified;
    

//   // validation of a1
//   const gTr1 = ec.curve.g.mul(r1)
//   const xTd1 = x.mul(d1)
//   const gTr1xTd1 = gTr1.add(xTd1)
//   printConsole && console.log('Is a1 the same?', gTr1xTd1.eq(a1))

//   // validation of b1
//   const pubKTr1 = pubK.mul(r1)
//   const yG = y.add(ec.curve.g)
//   const yGTd1 = yG.mul(d1)
//   const pubKTr1yGTd1 = pubKTr1.add(yGTd1)
//   printConsole && console.log('Is b1 the same?', pubKTr1yGTd1.eq(b1))

//   // validation of a2
//   const gTr2 = ec.curve.g.mul(r2)
//   const xTd2 = x.mul(d2)
//   const gTr2xTd2 = gTr2.add(xTd2)
//   printConsole && console.log('Is a2 the same?', gTr2xTd2.eq(a2))
//   // console.log('a2', a2.getX().toString('hex'), a2.getY().toString('hex'))
//   // console.log('a2', gTr2xTd2.getX().toString('hex'), gTr2xTd2.getY().toString('hex'))

//   // validation of b2
//   const pubKTr2 = pubK.mul(r2)
//   const generator_inverted = ec.curve.g.neg()
//   const yMinusG = y.add(generator_inverted)
//   const yMinusGTd2 = yMinusG.mul(d2)
//   const pubKTr2yMinusGTd2 = pubKTr2.add(yMinusGTd2)
//   printConsole && console.log('Is b2 the same?', pubKTr2yMinusGTd2.eq(b2))
        
    }  
}