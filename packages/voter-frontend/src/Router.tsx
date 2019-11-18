import React from 'react';

import { Route, Switch } from 'react-router-dom';
import ElGamalComponent from './components/ElGamal';
import EccElGamalComponent from './components/EccElGamal';
import PlayTrough from './components/PlayTrough';

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={PlayTrough} />
      <Route exact path="/finite" component={ElGamalComponent} />
      <Route path="/curve" component={EccElGamalComponent} />
    </Switch>
  );
};
