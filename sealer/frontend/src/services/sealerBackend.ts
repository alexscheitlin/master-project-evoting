import axios from "axios";

const sealerBackendUrl = () =>
  `http://${process.env.REACT_APP_SEALER_BACKEND_IP}:${process.env.REACT_APP_SEALER_BACKEND_PORT}`;

export const getWalletAddress = async (): Promise<string> => {
  const response = await axios.get(sealerBackendUrl() + "/register");

  return response.data.result;
};

export const registerWallet = async (wallet: string) => {
  const response = await axios.post(sealerBackendUrl() + "/register");
};

export const loadConfiguration = async () => {
  const response = await axios.get(sealerBackendUrl() + "/chainspec");
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
};

export const findPeers = async () => {
  const response = await axios.post(sealerBackendUrl() + "/peer");
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
};

export const getNrPeers = async (): Promise<number> => {
  const response = await axios.get(sealerBackendUrl() + "/peer");
  return response.data.nrOfPeers;
};
