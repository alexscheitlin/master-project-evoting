import React from 'react';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {fakeAuth} from '../util/auth';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const {from} = location.state || {from: {pathname: '/'}};
  const login = () => {
    fakeAuth.authenticate(() => {
      history.replace(from);
    });
  };

  return (
    <div>
      <button>
        <Link to={'/'}>Back</Link>
      </button>
      <p>You must log in to view the page at {from.pathname}</p>
      <button onClick={login}>Log in</button>
    </div>
  );
};

export default LoginPage;
