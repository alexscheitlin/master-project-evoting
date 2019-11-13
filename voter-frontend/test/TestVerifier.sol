pragma solidity >=0.4.25 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Verifier.sol";

contract TestVerifier {

  function testWrittenInSolidity() public {
    Verifier verifier = new Verifier();
    // TODO: test actual functionality of the verifier
    Assert.equal(uint(1), uint(1), "testWrittenInSolidity does not work");
  }
}
