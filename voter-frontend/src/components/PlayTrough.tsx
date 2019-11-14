import { FFelGamal, Cipher } from 'mp-crypto';
import React, { useState } from 'react';

import ballotABI from '../contracts/Ballot.json';
import voteVerifierABI from '../contracts/VoteProofVerifier.json';
import { useWeb3 } from '../hooks/useWeb3';

const { Encryption, Voting, VoteZKP, SumZKP } = FFelGamal;

const PlayTrough: React.FC = () => {
  const defaultAccount = '0x05f5E01f2D2073C8872Aca4213fD85F382CA681A';
  const [web3, ballot] = useWeb3(ballotABI);

  // set by bund and only known by bund
  const [systemParameters, setSystemParameters] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [publicKey, setPublicKey] = useState();
  const [systemParametersLoaded, setSystemParametersLoaded] = useState(false);
  const [verifiersLoaded, setVerifiersLoaded] = useState(false);

  // set by kanton locally
  const [localSystemParams, setLocalSystemParams] = useState();
  const [localPublicKey, setLocalPublicKey] = useState();
  const [localSystemParamsLoaded, SetLocalSystemParamsLoaded] = useState(false);
  const [localPublicKeyLoaded, setLocalPublicKeyLoaded] = useState(false);
  const [proofVerified, setProofVerified] = useState(false);

  // local store -> move to contract later
  const [votes, setVotes] = useState<Cipher[]>([]);

  const generateAndSetSystemParams = async () => {
    const keys = Encryption.generateKeysZKP(23, 2);
    const pk = keys[0];
    const sk = keys[1];

    // set local state
    setSystemParameters({
      p: pk.p,
      q: pk.q,
      g: pk.g,
    });
    setPublicKey(pk.h);
    setPrivateKey(sk);

    // set in contracts
    await ballot.setParameters([pk.p, pk.q, pk.g], { from: defaultAccount });
    await ballot.setPublicKey(pk.h, { from: defaultAccount });

    // all good
    setSystemParametersLoaded(true);
  };

  const getSystemParams = async () => {
    const systemParameters = await ballot.getParameters();
    setLocalSystemParams(systemParameters);
    SetLocalSystemParamsLoaded(true);
  };

  const getPublicKey = async () => {
    const publicKey = await ballot.getPublicKey();
    setLocalPublicKey(publicKey);
    setLocalPublicKeyLoaded(true);
  };

  const createVerifiers = async () => {
    await ballot.createVerifiers({ from: defaultAccount });
    setVerifiersLoaded(true);
  };

  const castYesVote = async () => {
    const params: FFelGamal.PublicKey = {
      p: localSystemParams[0],
      q: localSystemParams[1],
      g: localSystemParams[2],
      h: localPublicKey,
    };

    const vote = Voting.generateYesVote(params);
    const walletAddress = defaultAccount;
    const proof = VoteZKP.generateYesProof(vote, params, walletAddress);

    const yesBallot = await ballot.vote(
      [web3.utils.toBN(vote.a).toString(), web3.utils.toBN(vote.b).toString()],
      [web3.utils.toBN(proof.a0).toString(), web3.utils.toBN(proof.a1).toString()],
      [web3.utils.toBN(proof.b0).toString(), web3.utils.toBN(proof.b1).toString()],
      [web3.utils.toBN(proof.c0).toString(), web3.utils.toBN(proof.c1).toString()],
      [web3.utils.toBN(proof.f0).toString(), web3.utils.toBN(proof.f1).toString()],
      walletAddress,
      { from: defaultAccount },
    );

    setVotes([...votes, vote]);
    setProofVerified(yesBallot);

    console.log('ballot.verifyVote verified -->', yesBallot);
  };

  const endVoting = () => {
    const params: FFelGamal.PublicKey = {
      p: localSystemParams[0],
      q: localSystemParams[1],
      g: localSystemParams[2],
      h: localPublicKey,
    };
    const sum = Voting.addVotes(votes, params);
    const proof = SumZKP.generateSumProof(sum, params, privateKey, defaultAccount);
    const verifiedProof = SumZKP.verifySumProof(sum, proof, params, defaultAccount);

    console.log('sum proof correct -> ', verifiedProof);
  };

  const allInOne = async () => {
    const pk = Encryption.generateKeysZKP(23, 2)[0];
    const uniqueID = defaultAccount;

    // deploy contract and pass system parameters
    await ballot.setParameters([pk.p, pk.q, pk.g], { from: defaultAccount });
    await ballot.setPublicKey(pk.h, { from: defaultAccount });
    await ballot.createVerifiers({ from: defaultAccount });

    // yes vote
    const yesVote = 1;
    const yesEnc = Encryption.encrypt(yesVote, pk);
    const yesProof = VoteZKP.generateYesProof(yesEnc, pk, uniqueID);

    const yesVoteVerified = await ballot.verifyVote(
      [web3.utils.toBN(yesEnc.a).toString(), web3.utils.toBN(yesEnc.b).toString()],
      [web3.utils.toBN(yesProof.a0).toString(), web3.utils.toBN(yesProof.a1).toString()],
      [web3.utils.toBN(yesProof.b0).toString(), web3.utils.toBN(yesProof.b1).toString()],
      [web3.utils.toBN(yesProof.c0).toString(), web3.utils.toBN(yesProof.c1).toString()],
      [web3.utils.toBN(yesProof.f0).toString(), web3.utils.toBN(yesProof.f1).toString()],
      uniqueID,
    );

    setProofVerified(yesVoteVerified);

    console.log('allInOne verified -->', yesVoteVerified);
  };

  return (
    <div>
      <h1>Playthrough</h1>
      <div>
        <button onClick={generateAndSetSystemParams}>generateSystemParams</button>
        {systemParametersLoaded ? <span>OK</span> : null}
      </div>
      <div>
        <button onClick={getSystemParams}>getSystemParams</button>
        {localSystemParamsLoaded ? <span>OK</span> : null}
      </div>
      <div>
        <button onClick={getPublicKey}>getPublicKey</button>
        {localPublicKeyLoaded ? <span>OK</span> : null}
      </div>
      <div>
        <button onClick={createVerifiers}>createVerifiers</button>
        {verifiersLoaded ? <span>OK</span> : null}
      </div>
      <div>
        <button onClick={castYesVote}>create Proof and cast Vote</button>
        {proofVerified ? (
          <span>
            <strong>Proof verified</strong>
          </span>
        ) : (
          <span>Proof NOT verified</span>
        )}
      </div>
      <div>
        <button onClick={endVoting}>End Voting, calculate sum and sum-proof</button>
      </div>
      <hr></hr>
      <div>
        <button onClick={allInOne}>all in one</button>
      </div>
    </div>
  );
};

export default PlayTrough;
