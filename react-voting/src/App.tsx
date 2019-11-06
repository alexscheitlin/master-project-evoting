import React from 'react'

import './App.css'
import ElGamalComponent from './components/ElGamal'
import EccElGamalComponent from './components/EccElGamal'

const App: React.FC = () => {
  return (
    <div className="App">
      <ElGamalComponent />
      <hr></hr>
      <EccElGamalComponent />
    </div>
  )
}

export default App
