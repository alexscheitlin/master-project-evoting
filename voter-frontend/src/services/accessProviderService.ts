/* eslint-disable no-undef */
import axios from 'axios';

import { config } from '../config';

const ACCESS_PROVIDER_URL =
  process.env.NODE_ENV === 'development' ? config.accessProviderUrl.dev : config.accessProviderUrl.prod;

export const fundWallet = async (token: string, wallet: string): Promise<string> => {
  const requestBody = {
    token: token,
    address: wallet,
  };

  const res = await axios.post(ACCESS_PROVIDER_URL + '/register', requestBody);
  return res.data.ballot;
};
