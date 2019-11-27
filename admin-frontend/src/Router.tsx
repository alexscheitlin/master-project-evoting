import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Vote } from './components/Vote';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={Vote} />
    </Switch>
  );
};
