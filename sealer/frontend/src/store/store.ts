import { create } from 'zustand'
import { AuthBackend } from '../services/index'
import { VotingState } from '../models/states'

export const [useVoteStateStore] = create((set, get) => ({
  state: VotingState.REGISTER,
  setState: (newState: VotingState) =>
    set({
      state: newState,
    }),
  syncState: async () => {
    const currentState = get().state
    try {
      const newState: VotingState = await (await AuthBackend.getState()).state
      set({ state: newState })
    } catch (error) {
      console.log(error)
      set({ state: currentState })
    }
  },
}))

export const [useActiveStepStore] = create(set => ({
  activeStep: 0,
  setActiveStep: (step: number) => {
    set({ activeStep: step })
  },
  nextStep: () => set(prevState => ({ activeStep: prevState.activeStep + 1 })),
  reset: () => set({ activeStep: 0 }),
}))
