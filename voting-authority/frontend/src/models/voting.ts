import { create } from 'zustand'
import axios, { AxiosResponse } from 'axios'
import https from 'https'
import { DEV_URL } from '../constants'

export enum VotingState {
  REGISTER = 'REGISTER',
  STARTUP = 'STARTUP',
  CONFIG = 'CONFIG',
  VOTING = 'VOTING',
  TALLY = 'TALLY',
  RESULT = 'RESULT',
}

export const VOTE_STATES: string[] = [
  VotingState.REGISTER,
  VotingState.STARTUP,
  VotingState.CONFIG,
  VotingState.VOTING,
  VotingState.TALLY,
  VotingState.RESULT,
]

export enum VoteLabels {
  REGISTER = 'REGISTER',
  STARTUP = 'STARTUP',
  CONFIG = 'CONFIG',
  VOTING = 'VOTING',
  TALLY = 'TALLY',
  RESULT = 'RESULT',
}

export const VOTE_LABELS: string[] = [
  VoteLabels.REGISTER,
  VoteLabels.STARTUP,
  VoteLabels.CONFIG,
  VoteLabels.VOTING,
  VoteLabels.TALLY,
  VoteLabels.RESULT,
]

export const [useVoteStateStore] = create((set, get) => ({
  state: VotingState.REGISTER,
  setState: (newState: VotingState): void =>
    set({
      state: newState,
    }),
  nextState: async (): Promise<void> => {
    try {
      // avoids ssl error with certificate
      const agent = new https.Agent({
        rejectUnauthorized: false,
      })

      // there is no error handling here on purpose -> handle in calling component
      const response: AxiosResponse<StateResponse> = await axios.post(`${DEV_URL}/state`, {}, { httpsAgent: agent })
      if (response.status === 201) {
        const newState: VotingState = response.data.state
        set({ state: newState })
      } else {
        // TODO: think of a way to improve the error handling if the request fails. The goal is that zustand can be used to update the state using a request to the voting-authority-backend. The problem is that we only want to update the state in the here if the BE has update it. Therefore, we need to wait for a successful state change request. What shall we do if the request is not successful? Wait, display ErrorSnackbar, and let the user re-try.
        throw new Error(`State cannot be updated. ${response.status}, ${JSON.stringify(response.data)}`)
      }
    } catch (error) {
      console.log('inside voting.ts, error', error)
      // TODO: rethrow the error -> higher level component should handle it. We don't want to handle it here. But maybe we could return a Promise instead? Or how do we enusre that we can catch it higher up?
      throw new Error(error)
    }
  },
}))

interface StateResponse {
  state: VotingState
  registeredSealers: number
  requiredSealers: number
}

export const [useVoteQuestionStore] = create(set => ({
  question: '',
  setQuestion: (question: string): void => set({ question: question }),
}))

export const [useActiveStepStore] = create(set => ({
  activeStep: 0,
  setActiveStep: (step: number): void => {
    set({ activeStep: step })
  },
  nextStep: (): void => set(prevState => ({ activeStep: prevState.activeStep + 1 })),
}))
