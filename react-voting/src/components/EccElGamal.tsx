import React, { useState } from 'react'

import { EccElGamal, EccElGamalVoting, Cipher, Summary } from 'mp-crypto'
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const keyPair = ec.genKeyPair()
const privateKey = keyPair.getPrivate()
const publicKey = keyPair.getPublic()

const EccElGamalComponent: React.FC = () => {
  const [votes, setVotes] = useState<Cipher[]>([])
  const [result, setResult] = useState<number>(0)
  const [summary, setSummary] = useState<Summary>({ total: 0, yes: 0, no: 0 })

  const addYesVote = () => {
    const newVotes = [...votes, EccElGamalVoting.generateYesVote(publicKey)]
    setVotes(newVotes)
    getResult(newVotes)
  }

  const addNoVote = () => {
    const newVotes = [...votes, EccElGamalVoting.generateNoVote(publicKey)]
    setVotes(newVotes)
    getResult(newVotes)
  }

  const getResult = (votes: any[]) => {
    const result = EccElGamalVoting.tallyVotes(publicKey, privateKey, votes)
    setResult(result)

    const sum = EccElGamalVoting.getSummary(votes.length, result)
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
      Public Key: {JSON.parse(JSON.stringify(publicKey))[0]} {JSON.parse(JSON.stringify(publicKey))[1]}
      <br></br>
      Private Key: {JSON.stringify(privateKey)}
      <br></br>
      <br></br>
      Total: {summary.total} Yes: {summary.yes} No: {summary.no}
      <br></br>
      <br></br>
      Votes: {votes.length}
      {votes.map((vote, i) => (
        <div key={i}>
          {vote.c1.toNumber()}, {vote.c2.toNumber()} - {JSON.stringify(EccElGamal.decrypt(vote, privateKey))}
        </div>
      ))}
    </div>
  )
}

export default EccElGamalComponent
