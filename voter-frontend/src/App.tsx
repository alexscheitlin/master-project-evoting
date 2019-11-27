import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {Routes} from './Router';
import {LogoutButton} from './components/LogoutButton';

const App: React.FC = () => {
  return (
    <>
      <Router>
        <LogoutButton />
        <Routes />
      </Router>
    </>
  );
};

export default App;
