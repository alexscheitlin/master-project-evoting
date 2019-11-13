/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { BallotIF } from '../contract-interfaces/Ballot';
import ballotABI from '../contracts/Ballot.json';

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const contract = require('@truffle/contract');

interface Props {
  web3: Web3 | undefined;
}

export const Ballot: React.FC<Props> = ({ web3 }) => {
  const [res, setRes] = useState('');

  const loadContract = async () => {
    if (web3 !== undefined) {
      const MyContract = contract(ballotABI);
      MyContract.setProvider(provider);
      let instance: BallotIF;
      try {
        instance = await MyContract.deployed();
        const res = await instance.test();
        setRes(res.toNumber().toString());
      } catch (err) {
        alert(err);
        return;
      }
    }
  };

  useEffect(() => {
    loadContract();
  });

  return (
    <div>
      <div>
        <strong>Response: {res}</strong>
      </div>
    </div>
  );
};
