/* eslint-disable no-undef */
import axios from 'axios';

import { config } from '../config';

const IDENTITY_PROVIDER_URL =
  process.env.NODE_ENV === 'development' ? config.identityProviderUrl.dev : config.identityProviderUrl.prod;

export const getToken = async (username: string, password: string): Promise<string> => {
  const requestBody = {
    username: username,
    password: password,
  };

  try {
    const res = await axios.post(IDENTITY_PROVIDER_URL + '/getToken', requestBody);
    return res.data.token;
  } catch (error) {
    throw new Error('Login unsuccessful');
  }
};
