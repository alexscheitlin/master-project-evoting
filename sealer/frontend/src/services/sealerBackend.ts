import axios from 'axios';

export const getWalletAddress = async (): Promise<string> => {
  const url = `http://${process.env.REACT_APP_SEALER_BE_IP}:${process.env.REACT_APP_SEALER_BE_PORT}`;
  const response = await axios.get(url + '/register');

  return response.data.result;
};

export const registerWallet = async (wallet: string) => {
  const url = `http://${process.env.REACT_APP_SEALER_BE_IP}:${process.env.REACT_APP_SEALER_BE_PORT}`;
  console.log(url);
  const response = await axios.post(url + '/register');
  console.log(response);
};

export const loadConfiguration = async () => {
  const url = `http://${process.env.REACT_APP_SEALER_BE_IP}:${process.env.REACT_APP_SEALER_BE_PORT}`;
  const response = await axios.get(url + '/chainspec');
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
};

export const findPeers = async () => {
  const url = `http://${process.env.REACT_APP_SEALER_BE_IP}:${process.env.REACT_APP_SEALER_BE_PORT}`;
  const response = await axios.post(url + '/peer');
  console.log(response);
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
};

export const getNrPeers = async (): Promise<number> => {
  const url = `http://${process.env.REACT_APP_SEALER_BE_IP}:${process.env.REACT_APP_SEALER_BE_PORT}`;
  const response = await axios.get(url + '/peer');
  return response.data.nrOfPeers;
};
