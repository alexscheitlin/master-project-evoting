const EllipticLib = artifacts.require('EllipticCurve');
const Verifier = artifacts.require('Verifier');
const FiniteFieldVerifier = artifacts.require('FiniteFieldVerifier');

module.exports = function(deployer) {
  // TODO: find out what .link does and if it's needed
  deployer.deploy(EllipticLib);
  deployer.link(EllipticLib, Verifier);
  deployer.deploy(Verifier);
  deployer.deploy(FiniteFieldVerifier);
};
