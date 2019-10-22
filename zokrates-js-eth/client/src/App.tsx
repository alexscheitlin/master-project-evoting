import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader';
import './App.css';
import * as zokrates from 'zokrates-js';
import getWeb3 from '../utils/getWeb3';
import Verifier from './contracts/Verifier.json';
import { keys } from './keys';

const proofCode = `
  def main(private field a) -> (field):
    field result = if a == 0 then 1 else 0 fi
    return result
`;

interface Props {}

const App: React.FC<Props> = () => {
  const [verifierContract, setVerifierContract] = useState(null);
  const [zokratesProgram, setZokratesProgram] = useState(null);
  const [zokratesProof, setZokratesProof] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [votingOption, setVotingOption] = useState(0);

  function importResolver(location, path) {
    // implement your resolving logic here
    return {
      source: proofCode,
      location: path
    };
  }

  const loadWeb3 = async () => {
    const web3 = await getWeb3();
    console.log(web3);
    // get the contract instance
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Verifier.networks[networkId];

    const verifier = new web3.eth.Contract(
      Verifier.abi,
      deployedNetwork && deployedNetwork.address
    );

    console.log(verifier);

    // set web3 and contract to the state
    setVerifierContract(verifier);
    setWeb3(web3);
  };

  const loadZokrates = () => {
    const code = `
      def main(private field a) -> (field):
        field result = if a == 0 then 1 else 0 fi
        return result
      `;

    zokrates.initialize(importResolver).then(() => {
      const program = zokrates.compile(code, 'main');
      setZokratesProgram(program);
    });
  };

  // componentDidMount
  useEffect(() => {
    console.log(proofCode);
    loadWeb3();
    loadZokrates();
    return () => {
      console.log('destroying component');
    };
  }, []);

  const generateAnSubmitProof = () => {
    console.log('generating proof');

    // create witness
    const witness = zokrates.computeWitness(zokratesProgram, ['1']);

    // create proof
    const proof = zokrates.generateProof(
      zokratesProgram,
      witness,
      new Uint8Array(keys.provingKey)
    );

    const tempProof = JSON.parse(proof);
    setZokratesProof(tempProof);

    submitProof(tempProof);
  };

  const submitProof = async proof => {
    const success = await verifierContract.methods
      .verifyTx(proof.proof, proof.inputs)
      .call();
    console.log(success);
  };

  return (
    <div>
      <button onClick={generateAnSubmitProof}>
        generate proof for {votingOption}
      </button>
    </div>
  );
};

export default hot(module)(App);
