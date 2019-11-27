import React from 'react';

import {Route, Switch} from 'react-router-dom';
import Demo from './components/Demo';
import LoginPage from './views/LoginPage';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={LoginPage} />
      <Route path="/demo" component={Demo} />
    </Switch>
  );
};
