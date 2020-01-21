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
  REGISTRATION = 'REGISTRATION',
  PAIRING = 'PAIRING',
  KEY_GENERATION = 'KEY_GENERATION',
  VOTING = 'VOTING',
  TALLYING = 'TALLYING',
  RESULT = 'RESULT',
}
