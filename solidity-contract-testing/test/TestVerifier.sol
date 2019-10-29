pragma solidity >=0.4.25 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Verifier.sol";

contract TestVerifier {

  function testInitialBalanceWithNewMetaCoin() public {
    Verifier verifier = new Verifier();
    // TODO: test actual functionality of the verifier
    Assert.equal(uint(1), uint(1), "Owner should have 10000 MetaCoin initially");
  }
}
