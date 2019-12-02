import { create } from 'zustand';

export enum VotingState {
  PRE_VOTING = 'PRE_VOTING',
  VOTING = 'VOTING',
  POST_VOTING = 'POST_VOTING'
}

const voteStates = [VotingState.PRE_VOTING, VotingState.VOTING, VotingState.POST_VOTING];

export const [useStore] = create(set => ({
  voteState: VotingState.PRE_VOTING,
  nextState: () =>
    set(state => ({ voteState: voteStates[(voteStates.indexOf(state.voteState) + 1) % voteStates.length] })),
  reset: () => set({ voteState: VotingState.PRE_VOTING })
}));
