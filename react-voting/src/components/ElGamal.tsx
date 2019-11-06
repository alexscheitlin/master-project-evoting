import React, { useState } from 'react'

import { FFelGamal, Cipher, Summary } from 'mp-crypto'

const Encryption = FFelGamal.Encryption
const Voting = FFelGamal.Voting

const [pk, sk] = Encryption.generateKeys(137, 51)

const ElGamalComponent: React.FC = () => {
  const [votes, setVotes] = useState<Cipher[]>([])
  const [result, setResult] = useState<number>(0)
  const [summary, setSummary] = useState<Summary>({ total: 0, yes: 0, no: 0 })

  const addYesVote = () => {
    const newVotes = [...votes, Voting.generateYesVote(pk)]
    setVotes(newVotes)
    getResult(newVotes)
  }

  const addNoVote = () => {
    const newVotes = [...votes, Voting.generateNoVote(pk)]
    setVotes(newVotes)
    getResult(newVotes)
  }

  const getResult = (votes: any[]) => {
    const result = Voting.tallyVotes(pk, sk, votes)
    setResult(result)

    const sum = Voting.getSummary(votes.length, result)
    setSummary(sum)
  }

  return (
    <div>
      <button className="btn" onClick={addYesVote}>
        Vote Yes
      </button>{' '}
      <button className="btn" onClick={addNoVote}>
        Vote No
      </button>
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
        <div key={i}>
          {vote.a.toNumber()}, {vote.b.toNumber()} - {Encryption.decrypt1(vote, sk, pk).toNumber()}
        </div>
      ))}
    </div>
  )
}

export default ElGamalComponent
