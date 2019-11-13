import React, { useState, useEffect } from 'react';
import { Ballot } from './components/Ballot';
import getWeb3 from './util/getWeb3';
import Web3 from 'web3';

const App: React.FC = () => {
  const [web3, setWeb3] = useState<Web3>();

  const loadWeb3 = async () => {
    const web3 = await getWeb3();
    setWeb3(web3);
  };

  useEffect(() => {
    loadWeb3();
    return (): void => {};
  }, []);

  return (
    <div>
      <h1>Truffle React Typescript PoA Parity</h1>
      <p>Provider is MetaMask: {web3 && (web3.currentProvider as any).isMetaMask ? 'yes' : 'no'}</p>
      <Ballot web3={web3} />
    </div>
  );
};

export default App;
