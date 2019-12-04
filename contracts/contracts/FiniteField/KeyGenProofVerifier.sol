pragma solidity ^0.5.3;

import './ModuloMathLib.sol';

contract KeyGenProofVerifier {
    using ModuloMathLib for uint256;

    struct Proof {
        uint256 c;
        uint256 d;
    }

    struct Parameters {
        uint256 p; // prime
        uint256 q; // prime factor: p = 2*q+1
        uint256 g; // generator
    }

    Parameters private parameters;

    constructor() public {
        parameters = Parameters(0, 0, 0);
    }

    function initialize(uint256 p, uint256 q, uint256 g) public payable {
        parameters.p = p;
        parameters.q = q;
        parameters.g = g;
    }

    function verifyProof(
        uint256 c,
        uint256 d,
        uint256 h_, // public key share
        address id // msg sender
    ) public view returns (bool) {
        uint256 p = parameters.p;
        uint256 q = parameters.q;
        uint256 g = parameters.g;

        Proof memory _proof = Proof(c, d);

        uint256 b = computeB(g, p, h_, _proof.d, _proof.c);

        // recompute the challenge c = hash(id, h_, b)
        uint256 challenge = generateChallenge(q, id, h_, b);
        bool hashCheck = _proof.c == challenge;

        // verify that: g^d == b * h_^c
        uint256 gPowd = g.modPow(_proof.d, p);
        uint256 bhPowC = b.modMul(h_.modPow(_proof.c, p), p);
        bool dCheck = gPowd == bhPowC;

        return hashCheck && dCheck;
    }

    function computeB(uint256 g, uint256 p, uint256 h_, uint256 d, uint256 c) private view returns (uint256) {
        // recompute b = g^d/h_^c
        uint256 b_1 = g.modPow(d, p);
        uint256 b_2 = h_.modPow(c, p);
        uint256 b = b_1.modDiv(b_2, p);
        return b;
    }

    function generateChallenge(uint256 q, address id, uint256 h_, uint256 b) private view returns (uint256) {
        bytes32 c = keccak256(abi.encodePacked(id, h_, b));
        return (uint256(c) % q);
    }

}
