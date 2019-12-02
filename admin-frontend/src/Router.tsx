import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Voting } from './components/views/Voting';
import { Summary } from './components/views/Summary';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact from="/" to="/vote" component={Voting} />
      <Route path="/summary" component={Summary} />
    </Switch>
  );
};
