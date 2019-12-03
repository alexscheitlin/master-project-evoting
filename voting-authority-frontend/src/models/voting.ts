import { create } from 'zustand';

export enum VotingState {
  PRE_VOTING = 'PRE_VOTING',
  VOTING = 'VOTING',
  POST_VOTING = 'POST_VOTING'
}

const voteStates = [VotingState.PRE_VOTING, VotingState.VOTING, VotingState.POST_VOTING];

export const [useVoteStateStore] = create(set => ({
  state: VotingState.PRE_VOTING,
  nextState: () =>
    set(prevState => ({ state: voteStates[(voteStates.indexOf(prevState.state) + 1) % voteStates.length] })),
  reset: () => set({ state: VotingState.PRE_VOTING })
}));

export const [useVoteQuestionStore] = create(set => ({
  question: '',
  setQuestion: (question: string) => set({ question: question })
}));

export const [useActiveStepStore] = create(set => ({
  activeStep: 0,
  updateActiveStep: () => set(state => ({ activeStep: state.activeStep + 1 })),
  resetActiveStep: () => set({ activeStep: 0 })
}));
