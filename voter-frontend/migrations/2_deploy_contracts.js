const Ballot = artifacts.require('Ballot');
const EllipticLib = artifacts.require('EllipticCurve');
const Verifier = artifacts.require('Verifier');
const VoteProofVerifier = artifacts.require('VoteProofVerifier');
const SumProofVerifier = artifacts.require('SumProofVerifier');

const params = require('./constructor_params');

module.exports = function(deployer) {
  deployer.deploy(EllipticLib);
  deployer.link(EllipticLib, Verifier);
  deployer.deploy(Ballot);
  deployer.deploy(Verifier);
  deployer.deploy(VoteProofVerifier);
  deployer.deploy(SumProofVerifier);
};
