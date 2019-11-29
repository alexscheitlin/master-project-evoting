import React from 'react';
import LoginPage from './pages/LoginPage';
import LoadingPage from './pages/LoadingPage';
import VotingPage from './pages/VotingPage';
import {useAuth} from './hooks/useAuth';

const AppManager: React.FC = () => {
  const auth = useAuth();

  let authenticated = false;
  let initialized = false;

  if (auth !== null) {
    authenticated = auth.user.authenticated;
    initialized = auth.user.token !== '';
  }

  let activeComponent;
  if (!authenticated) {
    activeComponent = <LoginPage />;
  } else if (authenticated && !initialized) {
    activeComponent = <LoadingPage />;
  } else if (authenticated && initialized) {
    activeComponent = <VotingPage />;
  }

  return <>{activeComponent}</>;
};

export default AppManager;
