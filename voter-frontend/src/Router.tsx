import React from 'react';

import {Route, Switch, Redirect} from 'react-router-dom';
import DemoPage from './pages/DemoPage';
import LoginPage from './pages/LoginPage';
import VotingPage from './pages/VotingPage';
import PublicPage from './pages/PublicPage';
import {useAuth} from './hooks/useAuth';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={PublicPage} />
      <Route path="/login" component={LoginPage} />
      <PrivateRoute path="/voting">
        <VotingPage />
      </PrivateRoute>
      <Route path="/demo" component={DemoPage} />
    </Switch>
  );
};

interface PrivateRouteProps {
  children: React.ReactNode;
  path: string;
}
// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
const PrivateRoute: React.FC<PrivateRouteProps> = ({children, path, ...rest}) => {
  const {user}: any = useAuth();

  return (
    <Route
      {...rest}
      render={({location}) =>
        user && user.authenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: {from: location},
            }}
          />
        )
      }
    />
  );
};
