pragma solidity ^0.5.3;

import './lib/MathEC.sol';
import '../FiniteField/ModuloMathLib.sol';

contract VoteProofVerifierEC {
    struct Proof {
        uint256[2] a0;
        uint256[2] a1;
        uint256[2] b0;
        uint256[2] b1;
        uint256 c0;
        uint256 c1;
        uint256 f0;
        uint256 f1;
    }

    struct Cipher {
        uint256[2] a;
        uint256[2] b;
    }

    struct PublicKey {
        uint256 x;
        uint256 y;
    }

    struct Input {
        uint256 bn1;
        uint256 bn2;
        uint256[2] point;
        uint256[2] cipher;
        bool useGenerator;
    }

    PublicKey private publicKey;
    address private _owner;

    constructor() public {
        publicKey = PublicKey(0, 0);
        _owner = msg.sender;
    }

    function initialize(uint256 x, uint256 y) public payable {
        require(msg.sender == _owner);
        publicKey.x = x;
        publicKey.y = y;
    }

    function verifyProof(
        uint256[2] memory a,
        uint256[2] memory b,
        uint256[2] memory a0,
        uint256[2] memory a1,
        uint256[2] memory b0,
        uint256[2] memory b1,
        uint256 c0,
        uint256 c1,
        uint256 f0,
        uint256 f1
    ) public view returns (bool) {
        // cipher of the vote
        Cipher memory cipher = Cipher(a, b);

        // create a proof object
        Proof memory proof = Proof(a0, a1, b0, b1, c0, c1, f0, f1);

        bool v1 = verify1(proof.f0, proof.c0, proof.a0, cipher.a, true);
        bool v2 = verify1(proof.f1, proof.c1, proof.a1, cipher.a, true);
        bool v3 = verify1(proof.f0, proof.c0, proof.b0, cipher.b, false);
        bool v4 = verify2(proof.f1, proof.c1, proof.b1, cipher.b, false);
        bool v5 = verifyChallenge(
            cipher.a,
            cipher.b,
            proof.a0,
            proof.b0,
            proof.a1,
            proof.b1,
            proof.c0,
            proof.c1,
            msg.sender
        );

        return v1 && v2 && v3 && v4;
    }

    function verifyChallenge(
        uint256[2] memory cipherA,
        uint256[2] memory cipherB,
        uint256[2] memory a0,
        uint256[2] memory b0,
        uint256[2] memory a1,
        uint256[2] memory b1,
        uint256 c0,
        uint256 c1,
        address addr
    ) public view returns (bool) {
        // FIXME: NEED BIGINT LIBRARY FOR THIS TO WORK I THINK
        // WE ADD TWO 256 bit INTS here...
        uint256 value = ModuloMathLib.modAdd(c0, c1, MathEC.n());
        uint256 challenge = generateChallenge(MathEC.n(), addr, cipherA, cipherB, a0, b0, a1, b1);

        return value == challenge;
    }

    function generateChallenge(
        uint256 n,
        address id,
        uint256[2] memory a,
        uint256[2] memory b,
        uint256[2] memory a0,
        uint256[2] memory b0,
        uint256[2] memory a1,
        uint256[2] memory b1
    ) public view returns (uint256) {
        bytes32 h = keccak256(
            abi.encodePacked(id, a[0], a[1], b[0], b[1], a0[0], a0[1], b0[0], b0[1], a1[0], a1[1], b1[0], b1[1])
        );
        return uint256(h) % n;

    }

    function verify1(uint256 bn1, uint256 bn2, uint256[2] memory point, uint256[2] memory cipher, bool useGenerator)
        public
        view
        returns (bool)
    {
        Input memory input = Input(bn1, bn2, point, cipher, useGenerator);

        uint256 calc_1_x;
        uint256 calc_1_y;

        if (useGenerator) {
            (calc_1_x, calc_1_y) = MathEC.ecMul(input.bn1, MathEC.gx(), MathEC.gy());
        } else {
            (calc_1_x, calc_1_y) = MathEC.ecMul(input.bn1, publicKey.x, publicKey.y);
        }

        (uint256 calc_2_x, uint256 calc_2_y) = MathEC.ecMul(input.bn2, input.cipher[0], input.cipher[1]);
        (uint256 calc_3_x, uint256 calc_3_y) = MathEC.ecAdd(input.point[0], input.point[1], calc_2_x, calc_2_y);

        return (calc_1_x == calc_3_x) && (calc_1_y == calc_3_y);
    }

    function verify2(uint256 bn1, uint256 bn2, uint256[2] memory point, uint256[2] memory cipher, bool useGenerator)
        public
        view
        returns (bool)
    {
        Input memory input = Input(bn1, bn2, point, cipher, useGenerator);

        //ecMul(h, f1)
        (uint256 calc_1_x, uint256 calc_1_y) = MathEC.ecMul(input.bn1, publicKey.x, publicKey.y);

        //ecDiv(cipher.b, generator)
        (uint256 ginv_x, uint256 ginv_y) = MathEC.ecInv(MathEC.gx(), MathEC.gy());
        (uint256 ecDiv_x, uint256 ecDiv_y) = MathEC.ecAdd(input.cipher[0], input.cipher[1], ginv_x, ginv_y);

        // ecMul(ecDiv(b, g), c1))
        (uint256 calc_2_x, uint256 calc_2_y) = MathEC.ecMul(input.bn2, ecDiv_x, ecDiv_y);

        (uint256 calc_3_x, uint256 calc_3_y) = MathEC.ecAdd(input.point[0], input.point[1], calc_2_x, calc_2_y);

        return (calc_1_x == calc_3_x) && (calc_1_y == calc_3_y);
    }
}
