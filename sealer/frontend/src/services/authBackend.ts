import { config } from '../config';
import axios from 'axios';

export const subscribeToChainspec = async () => {
  const url = config.authBackend.devUrl;
  await axios.post(url + '/register');
};
