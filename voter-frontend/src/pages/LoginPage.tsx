import React, { useState } from 'react';

import LoginForm from '../components/LoginForm/LoginForm';
import { EIdentityProviderService } from '../services';
import { useVoterStore } from '../store';
import { delay } from '../util/helper';

const LoginPage: React.FC = () => {
  const voterState = useVoterStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState('');

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(false);
      setMsg('');
      await delay(500);
      const token = await EIdentityProviderService.getToken(username, password);
      voterState.setToken(token);
      voterState.setAuthenicated(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(true);
      setMsg('Login failed!');
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} msg={msg} />;
};

export default LoginPage;
