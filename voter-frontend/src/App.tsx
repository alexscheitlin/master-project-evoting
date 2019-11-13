import React, { useState, useEffect } from 'react';
import getWeb3 from './util/getWeb3';
import Web3 from 'web3';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes } from './Router';
import { Navigation } from './components/Navigation';
import { ChainInfo } from './components/ChainInfo';

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
    <Router>
      <Navigation />
      <ChainInfo web3={web3} />
      <Routes />
    </Router>
  );
};

export default App;
