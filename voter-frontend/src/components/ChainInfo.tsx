/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';

import { BallotIF } from '../contract-interfaces/Ballot';
import ballotABI from '../contracts/Ballot.json';
import { useWeb3 } from '../hooks/useWeb3';

const Wrapper = styled.div`
  padding: 1em;
  border: 1px solid black;
  borde-radius: 5px;
`;

export const ChainInfo: React.FC = () => {
  const [res, setRes] = useState('');

  const [web3, contract] = useWeb3(ballotABI);

  const testContract = async () => {
    if (contract !== undefined) {
      const res = await contract.test();
      setRes(res.toNumber().toString());
    }
  };

  useEffect(() => {
    testContract();
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
