pragma solidity >=0.4.25 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/VoteProofVerifierEC.sol";

contract TestVerifier {

  function testWrittenInSolidity() public {
    VoteProofVerifierEC verifier = new VoteProofVerifierEC();
    // TODO: test actual functionality of the verifier
    Assert.equal(uint(1), uint(1), "testWrittenInSolidity does not work");
  }
}
