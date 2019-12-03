import React, { useState } from 'react';

import LoginPage from './pages/LoginPage';
import VotingPage from './pages/VotingPage';

const AppManager: React.FC = () => {
  const [loaded, setLoaded] = useState(false);

  const handleLoadFinished = (): void => {
    setLoaded(true);
  };

  return <>{loaded ? <VotingPage /> : <LoginPage onLoadFinished={handleLoadFinished} />} </>;
};

export default AppManager;
