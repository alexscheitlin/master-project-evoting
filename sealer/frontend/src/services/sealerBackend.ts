import axios from "axios";

export const getWalletAddress = async (): Promise<string> => {
  const url = "http://localhost:" + process.env.REACT_APP_BACKEND_PORT;
  const response = await axios.get(url + "/register");

  return response.data.result;
};

export const registerWallet = async (wallet: string) => {
  const url = "http://localhost:" + process.env.REACT_APP_BACKEND_PORT;
  await axios.post(url + "/register");
};

export const loadConfiguration = async () => {
  const url = "http://localhost:" + process.env.REACT_APP_BACKEND_PORT;
  const response = await axios.get(url + "/chainspec");
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
};

export const findPeers = async () => {
  const url = "http://localhost:" + process.env.REACT_APP_BACKEND_PORT;
  const response = await axios.post(url + "/peer");
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
};

export const getNrPeers = async (): Promise<number> => {
  const url = "http://localhost:" + process.env.REACT_APP_BACKEND_PORT;
  const response = await axios.get(url + "/peer");
  return response.data.nrOfPeers;
};
