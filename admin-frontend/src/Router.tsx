import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { SideBar } from './components/views/SideBar';
import { Summary } from './components/views/Summary';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact from="/" to="/vote" component={SideBar} />
      <Route path="/summary" component={Summary} />
    </Switch>
  );
};
