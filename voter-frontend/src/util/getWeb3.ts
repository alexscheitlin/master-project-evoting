import Web3 from 'web3';
import {config} from '../config';

let p: Promise<Web3>;

const getWeb3 = (): Promise<Web3> => {
  if (!p) {
    p = new Promise<Web3>((resolve, reject) => {
      let web3: Web3 = (window as any).web3 as Web3;
      const provider = new Web3.providers.HttpProvider(config.url);
      web3 = new Web3(provider);
      (window as any).web3 = web3;
      resolve(web3);
    });
  }
  return p;
};

export default getWeb3;
