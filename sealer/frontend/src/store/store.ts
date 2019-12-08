import { create } from "zustand";
import { VotingState } from "../models/states";
import axios, { AxiosResponse } from "axios";
import { config } from "../config";

interface StateResponse {
  state: VotingState;
  registeredSealers: number;
  requiredSealers: number;
}

export const VOTE_STATES: string[] = [
  VotingState.REGISTER,
  VotingState.STARTUP,
  VotingState.CONFIG,
  VotingState.VOTING,
  VotingState.TALLY
];

export const [useVoteStateStore] = create((set, get) => ({
  state: VotingState.REGISTER,
  setState: (newState: VotingState) =>
    set({
      state: newState
    }),
  nextState: async () => {
    try {
      // there is no error handling here on purpose -> handle in calling component
      const response: AxiosResponse<StateResponse> = await axios.post(
        config.authBackend.devUrl + "/state"
      );
      if (response.status === 201) {
        const newState: VotingState = response.data.state;
        set({ state: newState });
      } else {
        // TODO: think of a way to improve the error handling if the request fails. The goal is that zustand can be used to update the state using a request to the voting-authority-backend. The problem is that we only want to update the state in the here if the BE has update it. Therefore, we need to wait for a successful state change request. What shall we do if the request is not successful? Wait, display ErrorSnackbar, and let the user re-try.
        throw new Error(
          `State cannot be updated. ${response.status}, ${JSON.stringify(
            response.data
          )}`
        );
      }
    } catch (error) {
      console.log("inside voting.ts, error", error);
      // TODO: rethrow the error -> higher level component should handle it. We don't want to handle it here. But maybe we could return a Promise instead? Or how do we enusre that we can catch it higher up?
      throw new Error(error);
    }
  }
}));

export const [useActiveStepStore] = create(set => ({
  activeStep: 0,
  nextStep: () => set(prevState => ({ activeStep: prevState.activeStep + 1 })),
  reset: () => set({ activeStep: 0 })
}));
