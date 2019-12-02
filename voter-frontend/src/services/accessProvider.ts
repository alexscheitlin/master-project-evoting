import getWeb3 from '../util/getWeb3';
import axios from 'axios';
import { config } from '../config';
import {
  NO_ACCOUNTS_FOUND_ERROR_MESSAGE,
  NOT_FUNDED_ERROR_MESSAGE,
  NO_CONTRACT_ADDRESS_ERROR_MESSAGE,
} from '../constants';

export const fundWallet = async (token: string, wallet: string): Promise<string> => {
  // TODO: the following code should be happening on the accessProvider
  // The Access Provider should get the address from the client and send some ether to it
  // In the return, it should also return the contract-address

  let accounts: string[];

  const web3 = await getWeb3();
  try {
    accounts = await web3.eth.getAccounts();
  } catch (error) {
    throw new Error(NO_ACCOUNTS_FOUND_ERROR_MESSAGE);
  }

  const receiver = web3.eth.defaultAccount;
  if (receiver !== null) {
    try {
      await web3.eth.sendTransaction({ from: accounts[0], to: receiver, value: web3.utils.toWei('1', 'ether') });
    } catch (error) {
      throw new Error(NOT_FUNDED_ERROR_MESSAGE);
    }
  }
  try {
    // TODO: the access provider should return this address
    const address = await axios.get(config.backend + '/deploy');
    return address.data.address;
  } catch (error) {
    throw new Error(NO_CONTRACT_ADDRESS_ERROR_MESSAGE);
  }
};
