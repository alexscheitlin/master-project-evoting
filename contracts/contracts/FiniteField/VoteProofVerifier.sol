pragma solidity ^0.5.3;

import './ModuloMathLib.sol';

contract VoteProofVerifier {
    using ModuloMathLib for uint256;

    struct Proof {
        uint256[2] cipher; // a, b
        uint256[2] a;
        uint256[2] b;
        uint256[2] c;
        uint256[2] f;
    }

    struct Parameters {
        uint256 p; // prime
        uint256 q; // prime factor: p = 2*q+1
        uint256 g; // generator
        uint256 h;
    }

    Parameters private parameters;

    constructor() public {
        parameters = Parameters(0, 0, 0, 0);
    }

    function initialize(uint256 p, uint256 q, uint256 g, uint256 h) public payable {
        parameters.p = p;
        parameters.q = q;
        parameters.g = g;
        parameters.h = h;
    }

    function verifyProof(
        uint256[2] memory cipher, // a, b
        uint256[2] memory a,
        uint256[2] memory b,
        uint256[2] memory c,
        uint256[2] memory f,
        address id
    ) public view returns (bool) {
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
        bool v5 = verifyV5(proof.a, proof.b, proof.c, proof.cipher, id);

        return v1 && v2 && v3 && v4 && v5;
    }

    function verifyV1(uint256 a0, uint256 c0, uint256 f0, uint256 cipher0) private view returns (bool) {
        uint256 l1 = parameters.g.modPow(f0, parameters.p);
        uint256 r1 = a0.modMul(cipher0.modPow(c0, parameters.p), parameters.p);
        return l1 == r1;
    }

    function verifyV2(uint256 a1, uint256 f1, uint256 c1, uint256 cipher0) private view returns (bool) {
        uint256 l2 = parameters.g.modPow(f1, parameters.p);
        uint256 r2 = a1.modMul(cipher0.modPow(c1, parameters.p), parameters.p);
        return l2 == r2;
    }

    function verifyV3(uint256 b0, uint256 c0, uint256 f0, uint256 cipher1) private view returns (bool) {
        uint256 l3 = parameters.h.modPow(f0, parameters.p);
        uint256 r3 = b0.modMul(cipher1.modPow(c0, parameters.p), parameters.p);
        return l3 == r3;
    }

    function verifyV4(uint256 b1, uint256 c1, uint256 f1, uint256 cipher1) private view returns (bool) {
        uint256 l4 = parameters.h.modPow(f1, parameters.p);
        uint256 r4_1 = cipher1.modDiv(parameters.g, parameters.p);
        uint256 r4_2 = r4_1.modPow(c1, parameters.p);
        uint256 r4 = b1.modMul(r4_2, parameters.p);
        return l4 == r4;
    }

    // verifies the challenge/hash
    function verifyV5(
        uint256[2] memory a,
        uint256[2] memory b,
        uint256[2] memory c,
        uint256[2] memory cipher,
        address uniqueID
    ) private view returns (bool) {
        // use the address of the sender once the verification call comes from the frontend
        // address of the caller provides a unique nonce for the hash
        uint256 lc = c[1].modAdd(c[0], parameters.q);
        bytes32 rc = keccak256(abi.encodePacked(uniqueID, cipher[0], cipher[1], a[0], b[0], a[1], b[1]));
        return lc == (uint256(rc) % parameters.q);
    }
}
