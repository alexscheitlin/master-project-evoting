import React, { useState } from 'react'

import { ECelGamal, Cipher, Summary } from 'mp-crypto'

const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const Encryption = ECelGamal.Encryption
const Voting = ECelGamal.Voting

const keyPair = ec.genKeyPair()
const privateKey = keyPair.getPrivate()
const publicKey = keyPair.getPublic()

const EccElGamalComponent: React.FC = () => {
  const [votes, setVotes] = useState<Cipher[]>([])
  const [result, setResult] = useState<number>(0)
  const [summary, setSummary] = useState<Summary>({ total: 0, yes: 0, no: 0 })

  const addYesVote = () => {
    const newVotes = [...votes, Voting.generateYesVote(publicKey)]
    setVotes(newVotes)
    getResult(newVotes)
  }

  const addNoVote = () => {
    const newVotes = [...votes, Voting.generateNoVote(publicKey)]
    setVotes(newVotes)
    getResult(newVotes)
  }

  const getResult = (votes: any[]) => {
    const result = Voting.tallyVotes(publicKey, privateKey, votes)
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
          {vote.a.toNumber()}, {vote.b.toNumber()} - {JSON.stringify(Encryption.decrypt(vote, privateKey))}
        </div>
      ))}
    </div>
  )
}

export default EccElGamalComponent
