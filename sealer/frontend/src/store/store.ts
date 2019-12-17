import { create } from 'zustand'
import { VotingState } from '../models/states'

export const [useVoteStateStore] = create((set, get) => ({
  state: VotingState.REGISTER,
  setState: (newState: VotingState): void =>
    set({
      state: newState,
    }),
}))

export const [useActiveStepStore] = create(set => ({
  activeStep: 0,
  setActiveStep: (step: number): void => {
    set({ activeStep: step })
  },
  nextStep: (): void => set(prevState => ({ activeStep: prevState.activeStep + 1 })),
  reset: (): void => set({ activeStep: 0 }),
}))
