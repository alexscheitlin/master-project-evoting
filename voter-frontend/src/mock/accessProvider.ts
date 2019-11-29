import getWeb3 from '../util/getWeb3';
import {axios, mock} from './axiosMock';

// Mock any GET request
// arguments for reply are (status, data, headers)
mock.onGet('/fundWallet').reply(200, {
  success: true,
});

export const fundWallet = async (token: string, wallet: string) => {
  return new Promise(resolve =>
    axios.get('/fundWallet', {params: {token: token, wallet: wallet}}).then(async (res: any) => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const to = web3.eth.defaultAccount;
      if (to !== null) {
        web3.eth.sendTransaction({from: accounts[0], to: to, value: web3.utils.toWei('1', 'ether')});
      }

      return resolve(res.data);
    }),
  );
};
