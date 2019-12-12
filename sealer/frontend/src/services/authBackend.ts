import axios, { AxiosResponse } from "axios";

import { config } from "../config";

interface StateResponse {
  state: any;
  registeredSealers: number;
  requiredSealers: number;
}

export const subscribeToChainspec = async () => {
  const url = config.authBackend.devUrl;
  try {
    await axios.post(url + "/register");
  } catch (error) {
    throw new Error(
      `Could not subscribe to state in auth backend: ${error.message}`
    );
  }
};

export const getState = async () => {
  try {
    const response: AxiosResponse<StateResponse> = await axios.get(
      config.authBackend.devUrl + "/state"
    );
    return response.data;
  } catch (error) {
    throw new Error(
      `Could not fetch state from auth backend: ${error.message}`
    );
  }
};
