/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { BallotIF } from '../contract-interfaces/Ballot';
import ballotABI from '../contracts/Ballot.json';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 1em;
  border: 1px solid black;
  borde-radius: 5px;
`;

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const contract = require('@truffle/contract');

interface Props {
  web3: Web3 | undefined;
}

export const ChainInfo: React.FC<Props> = ({ web3 }) => {
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
    <Wrapper>
      <div>
        <h3>Chain Info</h3>
        <strong>Response from deployed contract: {res}</strong>
      </div>
    </Wrapper>
  );
};
