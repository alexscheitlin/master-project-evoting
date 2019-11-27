import React from 'react';

import {Route, Switch} from 'react-router-dom';
import DemoPage from './pages/DemoPage';
import LoginPage from './pages/LoginPage';
import VotingPage from './pages/VotingPage';
import PublicPage from './pages/PublicPage';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route path="/" component={PublicPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/voting" component={VotingPage} />
      <Route path="/demo" component={DemoPage} />
    </Switch>
  );
};
