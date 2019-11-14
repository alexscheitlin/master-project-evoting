const Ballot = artifacts.require('Ballot');
const BigNumberLib = artifacts.require('BigNumber')
const BigNumberVerifier = artifacts.require('BigNumberVerifier')
const EllipticLib = artifacts.require('EllipticCurve');
const Verifier = artifacts.require('Verifier');
const VoteProofVerifier = artifacts.require('VoteProofVerifier');
const SumProofVerifier = artifacts.require('SumProofVerifier');

const params = require('./constructor_params');

module.exports = function (deployer) {
  deployer.deploy(EllipticLib);
  deployer.deploy(Verifier);
  deployer.link(EllipticLib, Verifier);

  deployer.deploy(BigNumberLib);
  deployer.deploy(BigNumberVerifier)
  deployer.link(BigNumberLib, BigNumberVerifier);

  deployer.deploy(Ballot);
  deployer.deploy(VoteProofVerifier);

  deployer.deploy(
    SumProofVerifier,
    params.params.ff.PublicKey.p,
    params.params.ff.PublicKey.q,
    params.params.ff.PublicKey.h,
    params.params.ff.PublicKey.g,
  );
};
