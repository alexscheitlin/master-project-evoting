import React, { useState } from 'react';

import { ElGamal, ElGamalVoting, Cipher, Summary } from 'mp-crypto';

const [pk, sk] = ElGamal.generateKeys(137, 51)

const ElGamalComponent: React.FC = () => {

  const [votes, setVotes] = useState<Cipher[]>([]);
  const [result, setResult] = useState<number>(0);
  const [summary, setSummary] = useState<Summary>({ total: 0, yes: 0, no: 0 });

  const addYesVote = () => {
    const newVotes = [...votes, ElGamalVoting.generateYesVote(pk)]
    setVotes(newVotes)
    getResult(newVotes)
  }

  const addNoVote = () => {
    const newVotes = [...votes, ElGamalVoting.generateNoVote(pk)]
    setVotes(newVotes)
    getResult(newVotes)
  }

  const getResult = (votes: any[]) => {
    const result = ElGamalVoting.tallyVotes(pk, sk, votes)
    setResult(result)

    const sum = ElGamalVoting.getSummary(votes.length, result)
    setSummary(sum)
  }

  return (
    <div>
      <button className="btn" onClick={addYesVote}>Vote Yes</button> <button className="btn" onClick={addNoVote}>Vote No</button>
      <br></br>
      <br></br>

      Public Key: p={pk.p.toNumber()} g={pk.g.toNumber()} h={pk.h.toNumber()}
      <br></br>
      Private Key: {sk.toNumber()}

      <br></br>
      <br></br>

      Total: {summary.total} Yes: {summary.yes} No: {summary.no}

      <br></br>
      <br></br>

      Votes: {votes.length}
      {votes.map((vote, i) => (
        <div key={i} >{vote.c1.toNumber()}, {vote.c2.toNumber()} - {ElGamal.decrypt1(vote, sk, pk).toNumber()}</div>
      ))}
    </div>
  );
}

export default ElGamalComponent;
