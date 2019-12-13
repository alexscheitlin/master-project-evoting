import { create } from "zustand";

export const [useActiveStepStore] = create(set => ({
  activeStep: 0,
  nextStep: () => set(prevState => ({ activeStep: prevState.activeStep + 1 })),
  reset: () => set({ activeStep: 0 })
}));
