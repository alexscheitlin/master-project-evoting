import React from 'react';

import './App.css';
import ElGamalComponent from './components/ElGamal';
import EccElGamalComponent from './components/EccElGamal';

const App: React.FC = () => {

  return (
    <div className="App">
      <header className="App-header" style={{ display: 'flex' }}>
        <div style={{width: '50%' }}>
          <ElGamalComponent></ElGamalComponent></div>
        <div style={{width: '50%' }}>
          <EccElGamalComponent></EccElGamalComponent></div>
      </header>
    </div>
  );
}

export default App;
