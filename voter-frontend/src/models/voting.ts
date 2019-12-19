export enum VotingOption {
  YES = 'YES',
  NO = 'NO',
  UNSPEC = '',
}

export enum SubmissionState {
  CONFIRMED = 'CONFIRMED',
  IN_SUBMISSION = 'IN_SUBMISSION',
  NOT_CONFIRMED = 'NOT_CONFIRMED',
}

export enum VotingState {
  REGISTER = 'REGISTER',
  STARTUP = 'STARTUP',
  CONFIG = 'CONFIG',
  VOTING = 'VOTING',
  TALLY = 'TALLY',
  RESULT = 'RESULT',
}
