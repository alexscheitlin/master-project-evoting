import React, { useState } from 'react'

import { getRandomWalletAddress } from '../helper'
import { FFelGamal, Cipher, Summary, ValidVoteProof, SumProof } from 'mp-crypto'

const { Encryption, Voting, VoteZKP, SumZKP } = FFelGamal

const [pk, sk] = Encryption.generateKeys(359, 32)

const ElGamalComponent: React.FC = () => {
  const [voterAddresses, setVoterAddresses] = useState<string[]>([])
  const [votes, setVotes] = useState<Cipher[]>([])
  const [voteProofs, setVoteProofs] = useState<ValidVoteProof[]>([])
  const [sum, setSum] = useState<Cipher>()
  const [sumProof, setSumProof] = useState<SumProof>()
  const [summary, setSummary] = useState<Summary>({ total: 0, yes: 0, no: 0 })

  const addYesVote = () => {
    const vote = Voting.generateYesVote(pk)
    const randomWalletAddress = getRandomWalletAddress()
    const proof = VoteZKP.generateYesProof(vote, pk, randomWalletAddress)
    const verifiedProof = VoteZKP.verifyVoteProof(vote, proof, pk, randomWalletAddress)

    if (!verifiedProof) {
      window.alert('Vote Proof Failed!')
      return
    }

    // store vote, proof and voter address
    const newVotes = [...votes, vote]
    setVotes(newVotes)
    setVoteProofs([...voteProofs, proof])
    setVoterAddresses([...voterAddresses, randomWalletAddress])

    // update voting results
    getResult(newVotes)
  }

  const addNoVote = () => {
    const vote = Voting.generateNoVote(pk)
    const randomWalletAddress = getRandomWalletAddress()
    const proof = VoteZKP.generateNoProof(vote, pk, randomWalletAddress)
    const verifiedProof = VoteZKP.verifyVoteProof(vote, proof, pk, randomWalletAddress)

    if (!verifiedProof) {
      window.alert('Vote Proof Failed!')
      return
    }

    // store vote, proof and voter address
    const newVotes = [...votes, vote]
    setVotes(newVotes)
    setVoteProofs([...voteProofs, proof])
    setVoterAddresses([...voterAddresses, randomWalletAddress])

    // update voting results
    getResult(newVotes)
  }

  const getResult = (votes: any[]) => {
    const sum = Voting.addVotes(votes, pk)
    const randomWalletAddress = getRandomWalletAddress()
    const proof = SumZKP.generateSumProof(sum, pk, sk, randomWalletAddress)
    const verifiedProof = SumZKP.verifySumProof(sum, proof, pk, randomWalletAddress)

    if (!verifiedProof) {
      window.alert('Sum Proof Failed!')
      return
    }

    // store sum and proof
    setSum(sum)
    setSumProof(proof)

    const summary = Voting.getSummary(votes.length, Encryption.decrypt1(sum, sk, pk).toNumber())
    setSummary(summary)
  }

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
      Public Key: p={pk.p.toNumber()} q={pk.q.toNumber()} g={pk.g.toNumber()} h={pk.h.toNumber()}
      <br></br>
      Private Key: {sk.toNumber()}
      <br></br>
      <br></br>
      Total: {summary.total} Yes: {summary.yes} No: {summary.no}
      {sum && sumProof && (
        <div>
          <br></br>
          <span style={{ display: 'inline-block', width: '150px' }}>
            Sum: {Encryption.decrypt1(sum, sk, pk).toNumber()} - {sum.a.toNumber()}, {sum.b.toNumber()}{' '}
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
              Vote: {Encryption.decrypt1(vote, sk, pk).toNumber()} - {vote.a.toNumber()}, {vote.a.toNumber()}
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
  )
}

export default ElGamalComponent
