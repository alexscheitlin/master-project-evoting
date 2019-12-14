import React, { useState } from 'react';

import LoginPage from './pages/LoginPage';
import VotingPage from './pages/VotingPage';

const AppManager: React.FC = () => {
  const [loaded, setLoaded] = useState(false);

  const handleLoadFinished = (): void => {
    setLoaded(true);
  };

  // LoginPage displays the login form per default
  // once the user submits her details, the LoginPage shows the LoadingPage
  // once everything is laoded correctly, the VotingPage is displayed
  return <>{loaded ? <VotingPage /> : <LoginPage onLoadFinished={handleLoadFinished} />} </>;
};

export default AppManager;
