import BN = require('bn.js')

import { Summary } from '../index'
import { Cipher, Curve, CurvePoint, Encryption, Helper } from './index'

export const yesVote = Curve.g
export const noVote = Curve.point(null, null)
const infinityPoint = yesVote.add(yesVote.neg())

export const generateYesVote = (pk: string | CurvePoint): Cipher => {
  return Encryption.encrypt(yesVote, Helper.deserializeCurvePoint(pk))
}

export const generateNoVote = (pk: string | CurvePoint): Cipher => {
  return Encryption.encrypt(noVote, Helper.deserializeCurvePoint(pk))
}

export const generateBaseVote = (pk: string | CurvePoint): Cipher => {
  return { a: Curve.g, b: Helper.deserializeCurvePoint(pk) }
} // encrypt with m=noVote, r=1

export const addVotes = (votes: Cipher[], pk: string | CurvePoint): Cipher => {
  return votes.reduce(
    (previous, current) => Encryption.homomorphicAdd(previous, current),
    generateBaseVote(pk)
  )
}

export const findPoint = (point: CurvePoint): number => {
  let sumPoint = noVote
  let counter = 0

  while (!point.eq(sumPoint)) {
    sumPoint = sumPoint.add(yesVote)
    counter += 1
  }

  return counter
}

// TODO: as there is a new noVotePoint, check if this is still needed
export const checkDecrypedSum = (decryptedSum: CurvePoint): number => {
  return decryptedSum.eq(infinityPoint) ? 0 : findPoint(decryptedSum)
}

export const tallyVotes = (pk: string, sk: BN, votes: Cipher[]): number => {
  // This function is called in the fronend and did not work with
  // passing a CurvePoint directly before. It failed in
  // the encrypt function with 'red works only with red numbers'.

  // Fix: Serialize the key in the fronend and extract the public key from the passed hex-string
  const publicKey = Helper.deserializeCurvePoint(pk)

  const sum = Encryption.decrypt(addVotes(votes, publicKey), sk)
  return checkDecrypedSum(sum)
}

export const getSummary = (total: number, tallyResult: number): Summary => {
  const yes = tallyResult - 0
  const no = total - yes
  return { total, yes, no } as Summary
}
