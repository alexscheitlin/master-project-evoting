import { FFelGamal, Cipher, ValidVoteProof } from 'mp-crypto';
import React, { useState } from 'react';

import ballotABI from '../contracts/Ballot.json';
import { useWeb3 } from '../hooks/useWeb3';

const { Encryption, Voting, VoteZKP, SumZKP } = FFelGamal;

const PlayTrough: React.FC = () => {
  const defaultAccount = '0x05f5E01f2D2073C8872Aca4213fD85F382CA681A';
  const [web3, ballot] = useWeb3(ballotABI);

  // set by bund and only known by bund
  const [privateKey, setPrivateKey] = useState();
  const [systemParametersLoaded, setSystemParametersLoaded] = useState(false);
  const [verifiersLoaded, setVerifiersLoaded] = useState(false);

  // set by kanton locally
  const [proofState, setProofState] = useState(false);

  const openBallot = async () => {
    await ballot.openBallot({ from: defaultAccount });
  };

  const closeBallot = async () => {
    await ballot.closeBallot({ from: defaultAccount });
  };

  const generateAndSetSystemParams = async () => {
    const keys = Encryption.generateKeysZKP(23, 2);
    const pk = keys[0];
    const sk = keys[1];

    // set local state
    setPrivateKey(sk);

    // set in contracts
    await ballot.setParameters([pk.p, pk.q, pk.g], { from: defaultAccount });
    await ballot.setPublicKey(pk.h, { from: defaultAccount });

    // all good
    setSystemParametersLoaded(true);
  };

  const createVerifiers = async () => {
    await ballot.createVerifiers({ from: defaultAccount });
    setVerifiersLoaded(true);
  };

  const castVote = async (type: number) => {
    const systemParameters = await ballot.getParameters();
    const publicKey = await ballot.getPublicKey();

    const params: FFelGamal.PublicKey = {
      p: systemParameters[0],
      q: systemParameters[1],
      g: systemParameters[2],
      h: publicKey,
    };

    let vote: Cipher;
    let proof: ValidVoteProof;
    if (type === 0) {
      vote = Voting.generateNoVote(params);
      proof = VoteZKP.generateNoProof(vote, params, defaultAccount);
    } else {
      vote = Voting.generateYesVote(params);
      proof = VoteZKP.generateYesProof(vote, params, defaultAccount);
    }

    await ballot
      .vote(
        [web3.utils.toBN(vote.a).toString(), web3.utils.toBN(vote.b).toString()],
        [web3.utils.toBN(proof.a0).toString(), web3.utils.toBN(proof.a1).toString()],
        [web3.utils.toBN(proof.b0).toString(), web3.utils.toBN(proof.b1).toString()],
        [web3.utils.toBN(proof.c0).toString(), web3.utils.toBN(proof.c1).toString()],
        [web3.utils.toBN(proof.f0).toString(), web3.utils.toBN(proof.f1).toString()],
        defaultAccount,
        { from: defaultAccount },
      )
      .then(
        (res: any) => {
          for (let i = 0; i < res.logs.length; i++) {
            const log = res.logs[i];
            if (log.event === 'VotingSuccessEvent' && log.args[1] === true) {
              console.log(log.args.reason);
              setProofState(true);
              break;
            }
            if (log.event === 'VotingSuccessEvent' && log.args[1] === false) {
              console.log(log.args.reason);
              setProofState(false);
              break;
            }
          }
        },
        (error: any) => console.log('something went wrong: ', error),
      );
  };

  const endVoting = async () => {
    const _votes = [];
    const _nrVotes = await ballot.getNumberOfVotes();

    for (let i = 0; i < _nrVotes.toNumber(); i++) {
      const vote = await ballot.getVote(i);
      const c: Cipher = {
        a: vote[0],
        b: vote[0],
      };
      _votes.push(c);
    }

    const systemParameters = await ballot.getParameters();
    const publicKey = await ballot.getPublicKey();

    const params: FFelGamal.PublicKey = {
      p: systemParameters[0],
      q: systemParameters[1],
      g: systemParameters[2],
      h: publicKey,
    };

    const sum = Voting.addVotes(_votes, params);
    const proof = SumZKP.generateSumProof(sum, params, privateKey, defaultAccount);

    await ballot
      .submitSumProof(
        web3.utils.toBN(sum.a).toString(),
        web3.utils.toBN(sum.b).toString(),
        web3.utils.toBN(proof.a1).toString(),
        web3.utils.toBN(proof.b1).toString(),
        web3.utils.toBN(proof.d).toString(),
        web3.utils.toBN(proof.f).toString(),
        defaultAccount,
        { from: defaultAccount },
      )
      .then(
        (res: any) => {
          for (let i = 0; i < res.logs.length; i++) {
            const log = res.logs[i];
            if (log.event === 'SumEvent' && log.args[1] === true) {
              console.log(log.args.reason);
              break;
            }
            if (log.event === 'SumEvent' && log.args[1] === false) {
              console.log(log.args.reason);
              break;
            }
          }
        },
        (error: any) => console.log('something went wrong: ', error),
      );
  };

  return (
    <div>
      <h1>Playthrough</h1>
      <div>
        <button onClick={openBallot}>openBallot</button>
        <button onClick={closeBallot}>closeBallot</button>
      </div>
      <div>
        <button onClick={generateAndSetSystemParams}>generateSystemParams</button>
        {systemParametersLoaded ? <span>OK</span> : null}
      </div>
      <div>
        <button onClick={createVerifiers}>createVerifiers</button>
        {verifiersLoaded ? <span>OK</span> : null}
      </div>
      <div>
        <button onClick={() => castVote(0)}>submit NO VOTE with Proof</button>
        <button onClick={() => castVote(1)}>submit YES VOTE with Proof</button>
        {proofState ? (
          <span>
            <strong>Vote Proof Verified</strong>
          </span>
        ) : (
          <span>Proof NOT verified</span>
        )}
      </div>
      <div>
        <button onClick={endVoting}>End Voting, calculate sum and sum-proof</button>
      </div>
    </div>
  );
};

export default PlayTrough;
