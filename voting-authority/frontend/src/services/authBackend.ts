import axios, { AxiosResponse } from 'axios';
import { DEV_URL } from '../constants';
import { VotingState } from '../models/voting';

interface StateResponse {
  state: VotingState;
}

export const fetchState = async (): Promise<StateResponse> => {
  const response: AxiosResponse<StateResponse> = await axios.get(`${DEV_URL}/state`);
  if (response.status === 200) {
    return response.data;
  }
  throw new Error(`GET /state -> Status: ${response.status}`);
};
