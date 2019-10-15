import React, { useState } from 'react';
import { hot } from 'react-hot-loader';
import './App.css';
import * as zokrates from 'zokrates-js';

interface Props {}

const App: React.FC<Props> = () => {
  const [solidityContract, setSolidityContract] = useState();

  const code = `def main(private field a, field b) -> (field):
  field result = if a * a == b then 1 else 0 fi
  return result`;
  function importResolver(location, path) {
    // implement your resolving logic here
    return {
      source: code,
      location: path
    };
  }

  zokrates.initialize(importResolver).then(() => {
    // we have to initialize wasm module before calling api functions

    // compile the program code
    const program = zokrates.compile(code, './root.zok');

    // generate the verifier key and proving key
    // => this should eventually be provided by the system
    const [verifierKey, provingKey] = zokrates.setup(program);

    // generate a witness for the proof
    const witness = zokrates.computeWitness(program, ['2', '4']);

    // generate the proof
    const proof = zokrates.generateProof(program, witness, provingKey);

    // generate a solidity contract, this should eventually be deployed
    // by the system beforehand
    const contract = zokrates.exportSolidityVerifier(verifierKey, true);
    setSolidityContract(contract);
    console.log(contract);
  });

  return (
    <div>
      <pre>
        <code>{solidityContract}</code>
      </pre>
    </div>
  );
};

export default hot(module)(App);
