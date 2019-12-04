import { create } from 'zustand';

export enum VotingState {
  REGISTER = 'REGISTER',
  STARTUP = 'SETUP',
  CONFIG = 'CONFIG',
  VOTING = 'VOTING',
  TALLY = 'TALLY'
}

export const VOTE_STATES: string[] = [
  VotingState.REGISTER,
  VotingState.STARTUP,
  VotingState.CONFIG,
  VotingState.VOTING,
  VotingState.TALLY
];

export enum VoteLabels {
  REGISTER = 'Node Registration',
  STARTUP = 'Infrastructure Setup',
  CONFIG = 'Vote Setup',
  VOTING = 'Voting Phase',
  TALLY = 'Vote Completed'
}

export const VOTE_LABELS: string[] = [
  VoteLabels.REGISTER,
  VoteLabels.STARTUP,
  VoteLabels.CONFIG,
  VoteLabels.VOTING,
  VoteLabels.TALLY
];

export const [useVoteStateStore] = create(set => ({
  state: VotingState.REGISTER,
  nextState: () =>
    set(prevState => ({ state: VOTE_STATES[(VOTE_STATES.indexOf(prevState.state) + 1) % VOTE_STATES.length] })),
  reset: () => set({ state: VotingState.REGISTER })
}));

export const [useVoteQuestionStore] = create(set => ({
  question: '',
  setQuestion: (question: string) => set({ question: question })
}));

export const [useActiveStepStore] = create(set => ({
  activeStep: 0,
  nextStep: () => set(prevState => ({ activeStep: prevState.activeStep + 1 })),
  reset: () => set({ activeStep: 0 })
}));
