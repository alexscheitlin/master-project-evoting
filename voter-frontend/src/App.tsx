import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {Routes} from './Router';
import AppWrapper from './components/Layout/AppWrapper/AppWrapper';
import {ProvideAuth} from './hooks/useAuth';

const App: React.FC = () => {
  return (
    <AppWrapper>
      <ProvideAuth>
        <Router>
          <Routes />
        </Router>
      </ProvideAuth>
    </AppWrapper>
  );
};

export default App;
