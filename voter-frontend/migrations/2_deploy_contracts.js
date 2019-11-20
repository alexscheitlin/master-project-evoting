const Ballot = artifacts.require('Ballot');
const EllipticLib = artifacts.require('EllipticCurve');
const Verifier = artifacts.require('Verifier');
const VoteProofVerifier = artifacts.require('VoteProofVerifier');
const SumProofVerifier = artifacts.require('SumProofVerifier');
const ModuloMathLib = artifacts.require('ModuloMath');

module.exports = function(deployer) {
  deployer.deploy(ModuloMathLib);
  deployer.link(ModuloMathLib, [SumProofVerifier, VoteProofVerifier, Ballot]);
  deployer.deploy(SumProofVerifier);
  deployer.deploy(VoteProofVerifier);
  deployer.deploy(Ballot);

  deployer.deploy(EllipticLib);
  deployer.link(EllipticLib, Verifier);

  deployer.deploy(Verifier);
};
