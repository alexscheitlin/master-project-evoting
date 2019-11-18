import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { Navigation } from './components/Navigation';
import { Routes } from './Router';

const App: React.FC = () => {
  return (
    <Router>
      <Navigation />
      <Routes />
    </Router>
  );
};

export default App;
