const Ballot = artifacts.require('Ballot');
const EllipticCurveLib = artifacts.require('EllipticCurveLib');
const VoteProofVerifierEC = artifacts.require('VoteProofVerifierEC');
const VoteProofVerifier = artifacts.require('VoteProofVerifier');
const SumProofVerifier = artifacts.require('SumProofVerifier');
const ModuloMathLib = artifacts.require('ModuloMathLib');

module.exports = function(deployer) {
  // link the ModuloMath library
  deployer.deploy(ModuloMathLib);
  deployer.link(ModuloMathLib, [SumProofVerifier, VoteProofVerifier, Ballot]);
  deployer.deploy(SumProofVerifier);
  deployer.deploy(VoteProofVerifier);
  deployer.deploy(Ballot);

  // link the Elliptic library
  deployer.deploy(EllipticCurveLib);
  deployer.link(EllipticCurveLib, VoteProofVerifierEC);
  deployer.deploy(VoteProofVerifierEC);
};
