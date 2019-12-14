import { Container, Paper } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

import ChainInfo from '../components/ChainInfo/ChainInfo';
import Question from '../components/Question/Question';
import VotingPanel from '../components/VotingPanel/VotingPanel';
import { AccessProviderService } from '../services';
import { useVoterStore } from '../store';
import getWeb3 from '../util/getWeb3';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    paddingTop: theme.spacing(16),
    display: 'flex',
    flexDirection: 'column',
  },
  paper: {
    padding: theme.spacing(2, 4, 0, 4),
    display: 'flex',
    flexDirection: 'column',
  },
}));

const VotingPage: React.FC = () => {
  const classes = useStyles();
  const [balance, setBalance] = useState('');
  const [votingQuestion, setVotingQuestion] = useState('');
  const voterState = useVoterStore();

  /**
   * Is called on page load
   *
   * Connects to the contract, get the balanace of the voters wallet,
   * the voting question etc.
   */
  const getChainInfo = async (): Promise<void> => {
    const connectionURL = await AccessProviderService.getConnectionNodeUrl();
    const web3: Web3 = await getWeb3(connectionURL);
    const balance = await web3.eth.getBalance(voterState.wallet);
    setBalance(balance);
    const question = await voterState.contract.methods.getVotingQuestion().call({ from: voterState.contractAddress });
    setVotingQuestion(question);
  };

  useEffect(() => {
    getChainInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="md" className={classes.wrapper}>
      <Paper>
        <div className={classes.paper}>
          <Question votingQuestion={votingQuestion} />
          <VotingPanel votingQuestion={votingQuestion} />
        </div>
        <ChainInfo contractAddress={voterState.contractAddress} walletAddress={voterState.wallet} balance={balance} />
      </Paper>
    </Container>
  );
};

export default VotingPage;
