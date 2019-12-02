import React, { useEffect, useState } from 'react';
import BallotContract from '../contract-abis/Ballot.json';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Question from '../components/Question/Question';
import getWeb3 from '../util/getWeb3';

const useStyles = makeStyles(() => ({
  question: {
    height: '30%',
    border: '1px solid red',
  },
  chain: {
    height: '20%',
    border: '1px solid blue',
  },
  voting: {
    height: '50%',
    border: '1px solid green',
  },
}));

const VotingPage: React.FC = () => {
  const classes = useStyles();
  const [balance, setBalance] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [votingQuestion, setVotingQuestion] = useState('');

  const getChainInfo = async (): Promise<void> => {
    const web3 = await getWeb3();
    const contractAddr = localStorage.getItem('address');
    if (contractAddr !== null) {
      setContractAddress(contractAddr);
      const defaultAcc = web3.eth.defaultAccount;
      if (defaultAcc !== null) {
        setWalletAddress(defaultAcc);
        const balance = await web3.eth.getBalance(defaultAcc);
        setBalance(balance);
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
    <Grid container direction="column" style={{ height: '100%' }}>
      <Grid item className={classes.question}>
        <Question votingQuestion={votingQuestion} />
      </Grid>
      <Grid item className={classes.chain}>
        <div>
          <strong>Contract Address: </strong>
          <span>{contractAddress}</span>
        </div>
        <div>
          <strong>My Wallet Address: </strong>
          <span>{walletAddress}</span>
        </div>
        <div>
          <strong>My Wallet Balance: </strong>
          <span>{balance}</span>
        </div>
      </Grid>
      <Grid item className={classes.voting}>
        Voting Panel
      </Grid>
    </Grid>
  );
};

export default VotingPage;
