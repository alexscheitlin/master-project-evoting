const Ballot = artifacts.require('Ballot');
const EllipticLib = artifacts.require('EllipticCurve');
const Verifier = artifacts.require('Verifier');
const VoteProofVerifier = artifacts.require('VoteProofVerifier');
const SumProofVerifier = artifacts.require('SumProofVerifier');

const params = require('./constructor_params');

module.exports = function (deployer) {
  deployer.deploy(Ballot);
  deployer.deploy(EllipticLib);
  deployer.link(EllipticLib, Verifier);
  deployer.deploy(Verifier);
  deployer.deploy(
    VoteProofVerifier,
    params.params.ff.PublicKey.p,
    params.params.ff.PublicKey.q,
    params.params.ff.PublicKey.h,
    params.params.ff.PublicKey.g,
  );
  deployer.deploy(
    SumProofVerifier,
    params.params.ff.PublicKey.p,
    params.params.ff.PublicKey.q,
    params.params.ff.PublicKey.h,
    params.params.ff.PublicKey.g,
  );
};
