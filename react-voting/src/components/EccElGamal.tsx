import React, { useState } from 'react'

import { ECelGamal, Cipher, Summary, ValidVoteProof } from 'mp-crypto'

const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const { Encryption, Voting, VoteZKP } = ECelGamal

const keyPair = ec.genKeyPair()
const privateKey = keyPair.getPrivate()
const publicKey = keyPair.getPublic()

// used for unique ID's mocking the voters wallet address

const getRandomWalletAddress = () => {
  return '0xAd4E7D8f03904b175a1F8AE0D88154f329ac9329' + getRandomArbitrary(1, Math.pow(2, 16))
}

const getRandomArbitrary = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const EccElGamalComponent: React.FC = () => {
  const [votes, setVotes] = useState<Cipher[]>([])
  const [proofs, setProofs] = useState<ValidVoteProof[]>([])
  const [result, setResult] = useState<number>(0)
  const [summary, setSummary] = useState<Summary>({ total: 0, yes: 0, no: 0 })

  const addYesVote = () => {
    const vote = Voting.generateYesVote(publicKey)
    const randomWalletAddress = getRandomWalletAddress()
    //const proof = VoteZKP.generateYesProof(vote, publicKey, randomWalletAddress)
    const newVotes = [...votes]

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
      <h2>ECC Elgamal</h2>
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
          <div style={{ borderBottom: '1px solid white', paddingTop: '1em', paddingBottom: '1em' }}>
            <div>C1: {JSON.stringify(vote.a)} </div>
            <div>C2: {JSON.stringify(vote.b)} </div>
            <div>decrypted: {JSON.stringify(Encryption.decrypt(vote, privateKey))} </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default EccElGamalComponent
