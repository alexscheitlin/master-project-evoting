export enum VotingState {
  REGISTER = 'REGISTER',
  STARTUP = 'STARTUP',
  CONFIG = 'CONFIG',
  VOTING = 'VOTING',
  TALLY = 'TALLY',
  RESULT = 'RESULT',
}

export const VOTE_STATES: string[] = [
  VotingState.REGISTER,
  VotingState.STARTUP,
  VotingState.CONFIG,
  VotingState.VOTING,
  VotingState.TALLY,
  VotingState.RESULT,
];

export enum VoteLabels {
  REGISTER = 'Address Registration',
  STARTUP = 'Starting Sealer Node',
  CONFIG = 'Key Generation',
  VOTING = 'Voting',
  TALLY = 'Tally Votes',
  RESULT = 'Result',
}

export const VOTE_LABELS: string[] = [
  VoteLabels.REGISTER,
  VoteLabels.STARTUP,
  VoteLabels.CONFIG,
  VoteLabels.VOTING,
  VoteLabels.TALLY,
  VoteLabels.RESULT,
];
