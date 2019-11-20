const Ballot = artifacts.require('Ballot');
const EllipticLib = artifacts.require('EllipticCurve');
const Verifier = artifacts.require('Verifier');
const VoteProofVerifier = artifacts.require('VoteProofVerifier');
const SumProofVerifier = artifacts.require('SumProofVerifier');
const ModuloMathLib = artifacts.require('ModuloMath');

module.exports = function(deployer) {
  deployer.deploy(ModuloMathLib);
  deployer.link(ModuloMathLib, [SumProofVerifier, Ballot]);
  deployer.deploy(SumProofVerifier);
  deployer.deploy(Ballot);

  deployer.deploy(EllipticLib);
  deployer.link(EllipticLib, Verifier);

  deployer.deploy(Verifier);
  deployer.deploy(VoteProofVerifier);
};
