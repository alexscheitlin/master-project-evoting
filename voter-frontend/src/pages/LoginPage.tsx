import React, { useState } from 'react';

import LoginForm from '../components/LoginForm/LoginForm';
import { EIdentityProviderService } from '../services';
import { useVoterStore } from '../store';
import LoadingPage from './LoadingPage';

interface Props {
  onLoadFinished: () => void;
}

const LoginPage: React.FC<Props> = ({ onLoadFinished }) => {
  const [loginSubmitted, setLoginSubmitted] = useState(false);
  const voterState = useVoterStore();

  const handleLogin = async (username: string, password: string) => {
    try {
      const token = await EIdentityProviderService.getToken(username, password);
      voterState.setToken(token);
      voterState.setAuthenicated(true);
      setLoginSubmitted(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>{loginSubmitted ? <LoadingPage onSetupComplete={onLoadFinished} /> : <LoginForm onLogin={handleLogin} />}</div>
  );
};

export default LoginPage;
