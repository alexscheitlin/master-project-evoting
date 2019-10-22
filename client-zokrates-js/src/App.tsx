import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader';
import './App.css';
import * as zokrates from 'zokrates-js';

interface Props {}

const App: React.FC<Props> = () => {
  const [solidityContract, setSolidityContract] = useState();
  const [key, setKey] = useState();

  const code = `
  def main(private field a) -> (field):
    field result = if a == 0 then 1 else 0 fi
    return result
  `;

  function importResolver(location, path) {
    // implement your resolving logic here
    return {
      source: code,
      location: path
    };
  }

  useEffect(() => {
    zokrates.initialize(importResolver).then(() => {
      // we have to initialize wasm module before calling api functions

      // compile the program code
      const program = zokrates.compile(code, 'main');

      // generate the verifier key and proving key
      // => this should eventually be provided by the system
      const keys = zokrates.setup(program);

      const verifierKey = keys[0];
      const provingKey = keys[1];
      setKey(provingKey);
      console.log(Array.from(provingKey));

      // generate a witness for the proof
      const witness = zokrates.computeWitness(program, ['1']);

      // generate the proof
      const proof = zokrates.generateProof(program, witness, provingKey);

      // generate a solidity contract, this should eventually be deployed
      // by the system beforehand
      const contract = zokrates.exportSolidityVerifier(verifierKey, true);
      setSolidityContract(contract);
    });
    return () => {};
  }, []);

  return (
    <div>
      <pre>
        <code>{solidityContract}</code>
      </pre>
    </div>
  );
};

export default hot(module)(App);
