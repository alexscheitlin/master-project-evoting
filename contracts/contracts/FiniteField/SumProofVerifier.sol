pragma solidity ^0.5.3;

import './ModuloMathLib.sol';

contract SumProofVerifier {
    using ModuloMathLib for uint256;

    struct Proof {
        uint256 a; // cipher
        uint256 b; // cipher
        uint256 a1;
        uint256 b1;
        uint256 d;
        uint256 f;
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
        uint256 a,
        uint256 b, // a, b
        uint256 a1,
        uint256 b1,
        uint256 d,
        uint256 f,
        address id,
        uint256 pubKey
    ) public view returns (bool) {
        // create a proof object
        // mostly needed because otherwise would throw compilation error that
        // stack depth is reached
        Proof memory proof = Proof(a, b, a1, b1, d, f);

        // recompute the challenge
        uint256 c = generateChallenge(proof.a, proof.b, proof.a1, proof.b1, id, parameters.q);

        // verification a^f == a1 * d^c
        uint256 l1 = proof.a.modPow(proof.f, parameters.p);
        uint256 r1 = proof.a1.modMul(proof.d.modPow(c, parameters.p), parameters.p);
        bool v1 = l1 == r1;

        // verification g^f == b1 * h^c
        uint256 l2 = parameters.g.modPow(proof.f, parameters.p);
        uint256 r2 = proof.b1.modMul(pubKey.modPow(c, parameters.p), parameters.p);
        bool v2 = l2 == r2;

        return v1 && v2;
    }

    function generateChallenge(uint256 a, uint256 b, uint256 a1, uint256 b1, address uniqueID, uint256 modulus)
        private
        pure
        returns (uint256)
    {
        bytes32 h = keccak256(abi.encodePacked(uniqueID, a, b, a1, b1));
        return uint256(h) % modulus;
    }
}
