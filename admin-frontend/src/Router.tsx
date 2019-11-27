import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Vote } from './components/views/Vote';
import { Summary } from './components/views/Summary';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact from="/" to="/vote" component={Vote} />
      <Route path="/summary" component={Summary} />
    </Switch>
  );
};
