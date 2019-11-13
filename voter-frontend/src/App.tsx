import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { ChainInfo } from './components/ChainInfo';
import { Navigation } from './components/Navigation';
import { Routes } from './Router';

const App: React.FC = () => {
  return (
    <Router>
      <Navigation />
      <ChainInfo />
      <Routes />
    </Router>
  );
};

export default App;
