import React from 'react';

import {Route, Switch} from 'react-router-dom';
import ElGamalComponent from './components/ElGamal';
import EccElGamalComponent from './components/EccElGamal';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={ElGamalComponent} />
      <Route path="/curve" component={EccElGamalComponent} />
    </Switch>
  );
};
