pragma solidity ^0.5.0;

import "./BigNumber.sol";

contract BigNumberVerifier {
  using BigNumber for *;

  //use these for printing in remix when using local node.
  event result_instance(bytes, bool, uint);

  function testAddition(bytes memory a_val, uint a_bitlen, bytes memory b_val, uint b_bitlen) public returns (bytes memory, bool, uint) {
    BigNumber.instance memory a = BigNumber.instance(a_val, false, a_bitlen);
    emit result_instance(a.val, a.neg, a.bitlen);

    BigNumber.instance memory b = BigNumber.instance(b_val, false, b_bitlen);
    emit result_instance(b.val, b.neg, b.bitlen);

    BigNumber.instance memory res = a.prepare_add(b);
    emit result_instance(res.val, res.neg, res.bitlen);

    return (res.val, res.neg, res.bitlen);
  }

  function test(bytes memory a_val, uint a_bitlen) public returns (bytes memory, bool, uint) {
    BigNumber.instance memory a = BigNumber.instance(a_val, false, a_bitlen);
    emit result_instance(a.val, a.neg, a.bitlen);
    return (a.val, a.neg, a.bitlen);
  }
}