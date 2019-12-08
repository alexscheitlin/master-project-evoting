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
