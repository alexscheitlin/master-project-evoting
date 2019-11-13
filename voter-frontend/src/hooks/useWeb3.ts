import { useEffect, useState } from 'react';
import Web3 from 'web3';

import { config } from '../config';
import getWeb3 from '../util/getWeb3';

import contract from '@truffle/contract/index';
const provider = new Web3.providers.HttpProvider(config.url);

export const useWeb3 = (abi: any) => {
  const [web3, setWeb3] = useState<any>();
  const [instance, setInstance] = useState<any>();

  useEffect(() => {
    async function load() {
      const _web3 = await getWeb3();
      setWeb3(_web3);

      if (_web3 !== undefined) {
        const _contract = contract(abi);
        _contract.setProvider(provider);

        let _instance;
        try {
          _instance = await _contract.deployed();
          setInstance(_instance);
        } catch (err) {
          alert(err);
          return;
        }
      }
    }

    load();
  }, [abi]);

  return [web3, instance];
};
