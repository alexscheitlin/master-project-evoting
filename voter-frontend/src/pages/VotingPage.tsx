import { Button, Container, Paper } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

import ChainInfo from '../components/ChainInfo/ChainInfo';
import Question from '../components/Question/Question';
import VotingPanel from '../components/VotingPanel/VotingPanel';
import BallotContract from '../contract-abis/Ballot.json';
import { useVoterStore } from '../store';
import getWeb3 from '../util/getWeb3';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    position: 'relative',
    width: '80%',
  },
}));

const VotingPage: React.FC = () => {
  const classes = useStyles();
  const [balance, setBalance] = useState('');
  const [votingQuestion, setVotingQuestion] = useState('');
  const state = useVoterStore();

  const initializePage = async () => {
    // get web3 context and the ballot contract
    const web3: Web3 = await getWeb3(state.getConnectionNodeUrl());
    //@ts-ignore
    const contract = new web3.eth.Contract(BallotContract.abi, state.getBallotContractAddress());

    // query the balance of the voter wallet
    const balance = await web3.eth.getBalance(state.getWallet());
    setBalance(balance);

    // get the voting question to display
    const question = await contract.methods.getVotingQuestion().call({ from: state.getBallotContractAddress() });
    setVotingQuestion(question);
  };

  useEffect(() => {
    initializePage();
  }, []);

  return (
    <>
      <Paper className={classes.paper}>
        <Question votingQuestion={votingQuestion} />
        <VotingPanel votingQuestion={votingQuestion} />
        <ChainInfo contractAddress={state.contractAddress} walletAddress={state.wallet} balance={balance} />
      </Paper>
    </>
  );
};

export default VotingPage;
