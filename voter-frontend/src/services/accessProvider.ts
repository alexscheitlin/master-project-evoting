import getWeb3 from '../util/getWeb3';
import axios from 'axios';
import {config} from '../config';

export const fundWallet = async (token: string, wallet: string): Promise<string> => {
  // TODO: the following code should be happening on the accessProvider
  // The Access Provider should get the address from the client and send some ether to it
  // In the return, it should also return the contract-address

  const web3 = await getWeb3();
  const accounts = await web3.eth.getAccounts();
  const to = web3.eth.defaultAccount;
  if (to !== null) {
    web3.eth.sendTransaction({from: accounts[0], to: to, value: web3.utils.toWei('1', 'ether')});
  }
  try {
    // TODO: the access provider should return this address
    const address = await axios.get(config.backend + '/deploy');
    return address.data.address;
  } catch (error) {
    console.log(error);
    throw new Error('Could not fund wallet');
  }
};
