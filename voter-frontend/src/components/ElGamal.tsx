import React, { useState } from 'react';

import { FFelGamal, Summary } from 'mp-crypto';

import { getRandomWalletAddress } from '../util/helper';

import ballotABI from '../contracts/Ballot.json';
import { useWeb3 } from '../hooks/useWeb3';

const { SystemSetup, Encryption, Voting, DecryptionProof, MembershipProof } = FFelGamal;

const [sp, { h: pk, sk }] = SystemSetup.generateSystemParametersAndKeysZKP(359, 32);

const ElGamalComponent: React.FC = () => {
  const [voterAddresses, setVoterAddresses] = useState<string[]>([]);
  const [votes, setVotes] = useState<FFelGamal.Cipher[]>([]);
  const [voteProofs, setVoteProofs] = useState<FFelGamal.ValidVoteProof[]>([]);
  const [sum, setSum] = useState<FFelGamal.Cipher>();
  const [sumProof, setSumProof] = useState<FFelGamal.SumProof>();
  const [summary, setSummary] = useState<Summary>({ total: 0, yes: 0, no: 0 });

  const [web3, contract] = useWeb3(ballotABI);

  const getResult = (votes: any[]) => {
    const sum = Voting.addVotes(votes, sp);
    const randomWalletAddress = getRandomWalletAddress();
    const proof = DecryptionProof.generate(sum, sp, sk, randomWalletAddress);
    const verifiedProof = DecryptionProof.verify(sum, proof, sp, pk, randomWalletAddress);

    if (!verifiedProof) {
      window.alert('Sum Proof Failed!');
      return;
    }

    // store sum and proof
    setSum(sum);
    setSumProof(proof);

    const summary = Voting.getSummary(votes.length, Encryption.decrypt1(sum, sk, sp).toNumber());
    setSummary(summary);
  };

  const addYesVote = async () => {
    const vote = Voting.generateYesVote(sp, pk);
    const randomWalletAddress = getRandomWalletAddress();
    const proof = MembershipProof.generateYesProof(vote, sp, pk, randomWalletAddress);
    const verifiedProof = MembershipProof.verify(vote, proof, sp, pk, randomWalletAddress);

    if (!verifiedProof) {
      window.alert('Vote Proof Failed!');
      return;
    }

    // store vote, proof and voter address
    const newVotes = [...votes, vote];
    setVotes(newVotes);
    setVoteProofs([...voteProofs, proof]);
    setVoterAddresses([...voterAddresses, randomWalletAddress]);

    // update voting results
    getResult(newVotes);
  };

  const addNoVote = () => {
    const vote = Voting.generateNoVote(sp, pk);
    const randomWalletAddress = getRandomWalletAddress();
    const proof = MembershipProof.generateNoProof(vote, sp, pk, randomWalletAddress);
    const verifiedProof = MembershipProof.verify(vote, proof, sp, pk, randomWalletAddress);

    if (!verifiedProof) {
      window.alert('Vote Proof Failed!');
      return;
    }

    // store vote, proof and voter address
    const newVotes = [...votes, vote];
    setVotes(newVotes);
    setVoteProofs([...voteProofs, proof]);
    setVoterAddresses([...voterAddresses, randomWalletAddress]);

    // update voting results
    getResult(newVotes);
  };

  return (
    <div>
      <h2>Elgamal Finite Field</h2>
      <button className="btn" onClick={addYesVote}>
        Vote Yes
      </button>
      <button className="btn" onClick={addNoVote}>
        Vote No
      </button>
      <br></br>
      <br></br>
      Public Key: p={sp.p.toNumber()} q={sp.q.toNumber()} g={sp.g.toNumber()} h={pk.toNumber()}
      <br></br>
      Private Key: {sk.toNumber()}
      <br></br>
      <br></br>
      Total: {summary.total} Yes: {summary.yes} No: {summary.no}
      {sum && sumProof && (
        <div>
          <br></br>
          <span style={{ display: 'inline-block', width: '150px' }}>
            Sum: {Encryption.decrypt1(sum, sk, sp).toNumber()} - {sum.a.toNumber()}, {sum.b.toNumber()}{' '}
          </span>
          Proof: {'{'}
          {sumProof.a1.toNumber()},{sumProof.b1.toNumber()},{sumProof.d.toNumber()},{sumProof.f.toNumber()}
          {'}'}
        </div>
      )}
      <br></br>
      Votes: {votes.length}
      <ul>
        {votes.map((vote, i) => (
          <li key={i}>
            <span style={{ display: 'inline-block', width: '150px' }}>
              Vote: {Encryption.decrypt1(vote, sk, sp).toNumber()} - {vote.a.toNumber()}, {vote.a.toNumber()}
            </span>
            <span style={{ display: 'inline-block', width: '310px' }}>
              Proof: {'{'}
              {voteProofs[i].a0.toNumber()},{voteProofs[i].a1.toNumber()},{voteProofs[i].b0.toNumber()},
              {voteProofs[i].b1.toNumber()},{voteProofs[i].c0.toNumber()},{voteProofs[i].c1.toNumber()},
              {voteProofs[i].f0.toNumber()},{voteProofs[i].f1.toNumber()}
              {'}'}
            </span>
            Address: {voterAddresses[i]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ElGamalComponent;
