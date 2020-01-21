export enum VotingState {
  REGISTRATION = 'REGISTRATION',
  PAIRING = 'PAIRING',
  KEY_GENERATION = 'KEY_GENERATION',
  VOTING = 'VOTING',
  TALLYING = 'TALLYING',
  RESULT = 'RESULT',
}


export const VOTE_STATES: string[] = [
  VotingState.REGISTRATION,
  VotingState.PAIRING,
  VotingState.KEY_GENERATION,
  VotingState.VOTING,
  VotingState.TALLYING,
  VotingState.RESULT,
]
