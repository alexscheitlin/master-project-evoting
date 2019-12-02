import React, { useState } from 'react';

import LoginForm from '../components/LoginForm/LoginForm';
import { useVote } from '../hooks/useVote';
import LoadingPage from './LoadingPage';

interface Props {
  onLoadFinished: () => void;
}

const LoginPage: React.FC<Props> = ({ onLoadFinished }) => {
  const [loginSubmitted, setLoginSubmitted] = useState(false);
  const ctx = useVote();

  const handleLogin = (username: string, password: string) => {
    if (ctx !== null) {
      ctx.login(username, password).then(() => {
        setLoginSubmitted(true);
      });
    }
  };

  return (
    <div>{loginSubmitted ? <LoadingPage onSetupComplete={onLoadFinished} /> : <LoginForm onLogin={handleLogin} />}</div>
  );
};

export default LoginPage;
