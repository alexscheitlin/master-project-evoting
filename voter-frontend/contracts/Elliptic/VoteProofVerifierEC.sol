pragma solidity ^0.5.0;

import "./lib/MathEC.sol";

contract VoteProofVerifierEC {

    // Public Key of the elGamal System, in the future, this should probably be set in a contructor
    // or passed as additional function argument to the verifyProof()
    uint256 constant pkX = 0x8e81a4b79ebab6d063730feba5bb4d943bb33185fd6d29a25a322a797757fd23;
    uint256 constant pkY = 0x50e9734783787d55abe859dbe32049aea0854a7434fc1e093aed90800adda40c;

    ///////////////////////////////////////////////////////////////////////////////////
    // Structs
    ///////////////////////////////////////////////////////////////////////////////////
    struct Proof {
        uint[2] x;
        uint[2] y;
        uint[2] a1;
        uint[2] a2;
        uint[2] b1;
        uint[2] b2;
        uint256 d1;
        uint256 d2;
        uint256 r1;
        uint256 r2;
        uint256 challenge;
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // VERIFIER CORE FUNCTIONS
    ///////////////////////////////////////////////////////////////////////////////////
    function verifyProof(
        uint[2] memory _x,
        uint[2] memory _y,
        uint[2] memory _a1,
        uint[2] memory _a2,
        uint[2] memory _b1,
        uint[2] memory _b2,
        uint256 _d1,
        uint256 _d2,
        uint256 _r1,
        uint256 _r2,
        uint256 _challenge
        ) public pure returns (bool b) {

        // create a proof object
        Proof memory proof = Proof(_x,_y,_a1,_a2,_b1,_b2,_d1,_d2,_r1,_r2,_challenge);

        // 1. Step: validate hash (c)
        bool challenge_verified = verifyChallenge(proof.d1, proof.d2, proof.challenge);

        // 2. Step: validate (a1)
        bool a1_verified = verifyA1(proof.r1, proof.d1, proof.a1, proof.x);

        // 3. Step: validate (b1)
        bool b1_verified = verifyB1(proof.r1, proof.d1, proof.b1, proof.y);

        // 4. Step: validate (a2)
        // FIXME: this does not work, always false, wait until fixed in crypto library
        bool a2_verified = verifyA2(proof.r2, proof.d2, proof.a2, proof.x);

        // 5. Step: validate (b2)
        // FIXME: this does not work, always false, wait until fixed in crypto library
        bool b2_verified = verifyB2(proof.r2, proof.d2, proof.b2, proof.y);

        bool proofVerified = challenge_verified && a1_verified && b1_verified;

        return proofVerified;

    }

    function verifyChallenge(uint256 d1, uint256 d2, uint256 challenge) public pure returns(bool b) {
        uint256 d1d2 = (d1 + d2) % MathEC.curveModulus();
        return d1d2 == challenge;
    }

    function verifyA1(uint256 r1, uint256 d1, uint256[2] memory a1, uint256[2] memory x) public pure returns(bool b) {
        // const gTr1 = ec.curve.g.mul(r1)
        (uint256 gTr1_1, uint256 gTr1_2) = MathEC.ecMul(r1, MathEC.gx(), MathEC.gy());

        // const xTd1 = x.mul(d1)
        (uint256 xTd1_1, uint256 xTd1_2) = MathEC.ecMul(d1, x[0], x[1]);

        // const gTr1xTd1 = gTr1.add(xTd1)
        (uint256 gTr1xTd1_1, uint256 gTr1xTd1_2) = MathEC.ecAdd(gTr1_1, gTr1_2,xTd1_1, xTd1_2);

        bool verified = (gTr1xTd1_1 == a1[0]) && (gTr1xTd1_2 == a1[1]);

        return verified;
    }

    function verifyB1(uint256 r1, uint256 d1, uint256[2] memory b1, uint256[2] memory y) public pure returns(bool b) {
        // const pubKTr1 = pubK.mul(r1)
        (uint256 pubKTr1_1, uint256 pubKTr1_2) = MathEC.ecMul(r1, pkX, pkY);

        // const yG = y.add(ec.curve.g)
        (uint256 yG_1, uint256 yG_2) = MathEC.ecAdd(y[0], y[1], MathEC.gx(), MathEC.gy());

        // const yGTd1 = yG.mul(d1)
        (uint256 yGTd1_1, uint256 yGTd1_2) = MathEC.ecMul(d1, yG_1, yG_2);

        // const pubKTr1yGTd1 = pubKTr1.add(yGTd1)
        (uint256 pubKTr1yGTd1_1, uint256 pubKTr1yGTd1_2) = MathEC.ecAdd(pubKTr1_1, pubKTr1_2, yGTd1_1, yGTd1_2);

        bool verified = (pubKTr1yGTd1_1 == b1[0]) && (pubKTr1yGTd1_2 == b1[1]);

        return verified;
    }

    function verifyA2(uint256 r2, uint256 d2, uint256[2] memory a2, uint256[2] memory x) public pure returns(bool b) {
        // const gTr2 = ec.curve.g.mul(r2)
        (uint256 gTr2_1, uint256 gTr2_2) = MathEC.ecMul(r2, MathEC.gx(), MathEC.gy());

        // const xTd2 = x.mul(d2)
        (uint256 xTd2_1, uint256 xTd2_2) = MathEC.ecMul(d2, x[0], x[1]);

        // const gTr2xTd2 = gTr2.add(xTd2)
        (uint256 gTr2xTd2_1, uint256 gTr2xTd2_2) = MathEC.ecAdd(gTr2_1, gTr2_2, xTd2_1, xTd2_2);

        bool verified = (gTr2xTd2_1 == a2[0]) && (gTr2xTd2_2 == a2[1]);

        return verified;
    }

    function verifyB2(uint256 r2, uint256 d2, uint256[2] memory b2, uint256[2] memory y) public pure returns(bool b) {
        // const pubKTr2 = pubK.mul(r2)
        (uint256 pubKTr2_1, uint256 pubKTr2_2) = MathEC.ecMul(r2, pkX, pkX);

        // const generator_inverted = ec.curve.g.neg()
        (uint256 ginv_x, uint256 ginv_y) = MathEC.ecInv(MathEC.gx(), MathEC.gy());

        // const yMinusG = y.add(generator_inverted)
        (uint256 yMinusG_1, uint256 yMinusG_2) = MathEC.ecAdd(y[0], y[1], ginv_x, ginv_y);

        // const yMinusGTd2 = yMinusG.mul(d2)
        (uint256 yMinusGTd2_1, uint256 yMinusGTd2_2) = MathEC.ecMul(d2, yMinusG_1, yMinusG_2);

        // const pubKTr2yMinusGTd2 = pubKTr2.add(yMinusGTd2)
        (uint256 pubKTr2yMinusGTd2_1, uint256 pubKTr2yMinusGTd2_2) = MathEC.ecAdd(pubKTr2_1, pubKTr2_2, yMinusGTd2_1, yMinusGTd2_2);

        bool verified = (pubKTr2yMinusGTd2_1 == b2[0]) && (pubKTr2yMinusGTd2_2 == b2[1]);

        return verified;
    }
}