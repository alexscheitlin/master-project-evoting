import React from 'react';

import AppManager from './AppManager';
import AppWrapper from './components/Layout/AppWrapper/AppWrapper';

const App: React.FC = () => {
  return (
    <AppWrapper>
      <AppManager />
    </AppWrapper>
  );
};

export default App;
