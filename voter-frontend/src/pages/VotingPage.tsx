import { Container, Paper } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';

import ChainInfo from '../components/ChainInfo/ChainInfo';
import Question from '../components/Question/Question';
import VotingPanel from '../components/VotingPanel/VotingPanel';
import BallotContract from '../contract-abis/Ballot.json';
import getWeb3 from '../util/getWeb3';
import { useVote } from '../hooks/useVote';

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
  question: {},
  chain: {},
  voting: {},
}));

const VotingPage: React.FC = () => {
  const classes = useStyles();
  const [balance, setBalance] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [votingQuestion, setVotingQuestion] = useState('');
  const ctx = useVote();

  const getChainInfo = async (): Promise<void> => {
    const web3 = await getWeb3();
    if (ctx !== null) {
      const contractAddr = ctx.contractAddress;
      setContractAddress(contractAddr);
      const defaultAcc = web3.eth.defaultAccount;
      if (defaultAcc !== null) {
        setWalletAddress(defaultAcc);
        const balance = await web3.eth.getBalance(defaultAcc);
        setBalance(balance);
        // @ts-ignore
        const contract = new web3.eth.Contract(BallotContract.abi, contractAddr);
        const question = await contract.methods.getVotingQuestion().call({ from: walletAddress });
        setVotingQuestion(question);
      }
    }
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
        <ChainInfo contractAddress={contractAddress} walletAddress={walletAddress} balance={balance} />
      </Paper>
    </Container>
  );
};

export default VotingPage;
