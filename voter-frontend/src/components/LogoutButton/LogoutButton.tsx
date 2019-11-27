import React from 'react';
import {useHistory} from 'react-router';
import {fakeAuth} from '../../util/auth';

export const LogoutButton = () => {
  const history = useHistory();

  return fakeAuth.isAuthenticated ? (
    <p>
      Welcome!
      <button
        onClick={() => {
          fakeAuth.signout(() => history.push('/'));
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  );
};
