import React from 'react';

import AppManager from './AppManager';
import AppWrapper from './components/Layout/AppWrapper/AppWrapper';
import { ProvideAuth } from './hooks/useUser';

const App: React.FC = () => {
  return (
    <AppWrapper>
      <ProvideAuth>
        <AppManager />
      </ProvideAuth>
    </AppWrapper>
  );
};

export default App;
