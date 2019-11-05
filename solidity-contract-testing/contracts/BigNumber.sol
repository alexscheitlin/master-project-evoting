pragma solidity ^0.5.0;

// Our own implementation of a BigInt library
// Might be used at a later stage once the verification
// runs correctly for small numbers on chain

contract BigNumber {

    struct bigint {
        uint[] limbs;
    }

    function fromUint(uint x) internal pure returns (bigint memory r) {
        r.limbs = new uint[](1);
        r.limbs[0] = x;
    }

    function add(bigint memory _a, bigint memory _b) internal pure returns (bigint memory r) {
        r.limbs = new uint[](max(_a.limbs.length, _b.limbs.length));
        uint carry = 0;
        for (uint i = 0; i < r.limbs.length; ++i) {
            uint a = limb(_a, i);
            uint b = limb(_b, i);
            r.limbs[i] = a + b + carry;
            if (a + b < a || (a + b == uint(-1) && carry > 0))
                carry = 1;
            else
                carry = 0;
        }
        if (carry > 0) {
            // too bad, we have to add a limb
            uint[] memory newLimbs = new uint[](r.limbs.length + 1);
            uint i;
            for (i = 0; i < r.limbs.length; ++i)
                newLimbs[i] = r.limbs[i];
            newLimbs[i] = carry;
            r.limbs = newLimbs;
        }
    }

    function sub(bigint memory _a, bigint memory _b) internal pure returns(bigint memory r) {

    }

    function mul(bigint memory _a, bigint memory _b) internal pure returns(bigint memory) {

    }

    function div(bigint memory _a, bigint memory _b) internal pure returns(bigint memory) {

    }

    function limb(bigint memory _a, uint _limbIndex) internal pure returns (uint) {
        return _limbIndex < _a.limbs.length ? _a.limbs[_limbIndex] : 0;
    }

    function max(uint a, uint b) private pure returns (uint) {
        return a > b ? a : b;
    }
}