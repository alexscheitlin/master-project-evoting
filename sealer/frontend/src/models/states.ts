export enum VotingState {
  REGISTER = 'REGISTER',
  STARTUP = 'STARTUP',
  CONFIG = 'CONFIG',
  VOTING = 'VOTING',
  TALLY = 'TALLY',
}

export const VOTE_STATES: string[] = [VotingState.REGISTER, VotingState.STARTUP, VotingState.CONFIG, VotingState.VOTING, VotingState.TALLY];

export enum VoteLabels {
  REGISTER = 'Address Registration',
  STARTUP = 'Starting Sealer Node',
  CONFIG = 'Key Generation',
  VOTING = 'Voting',
  TALLY = 'Tally Votes',
}

export const VOTE_LABELS: string[] = [VoteLabels.REGISTER, VoteLabels.STARTUP, VoteLabels.CONFIG, VoteLabels.VOTING, VoteLabels.TALLY];
