import React, { useState } from 'react';

import LoginForm from '../components/LoginForm/LoginForm';
import { EIdentityProviderService } from '../services';
import { useVoterStore } from '../store';

const LoginPage: React.FC = () => {
  const voterState = useVoterStore();

  const handleLogin = async (username: string, password: string) => {
    try {
      const token = await EIdentityProviderService.getToken(username, password);
      voterState.setToken(token);
      voterState.setAuthenicated(true);
    } catch (error) {
      console.log(error);
    }
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;
