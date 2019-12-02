import React from 'react';

import AppManager from './AppManager';
import AppWrapper from './components/Layout/AppWrapper/AppWrapper';
import { ProvideVoterContext } from './hooks/useVote';

const App: React.FC = () => {
  return (
    <AppWrapper>
      <ProvideVoterContext>
        <AppManager />
      </ProvideVoterContext>
    </AppWrapper>
  );
};

export default App;
