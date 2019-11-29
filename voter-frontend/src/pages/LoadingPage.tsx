import {CircularProgress, Container} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, {useEffect, useState} from 'react';

import SimpleStorage from '../contracts/SimpleStorage.json';
import {useUser} from '../hooks/useUser';
import getWeb3 from '../util/getWeb3';
import {delay} from '../util/helper';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      marginTop: theme.spacing(16),
    },
  }),
);

function getSteps() {
  return ['Checking your Login', 'Creating Voter Account', 'Setting up Wallet', 'Connect to Blockchain'];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return `Making sure you are logged in correctly`;
    case 1:
      return 'Generating your Wallet';
    case 2:
      return 'Adding Funds to your Wallet';
    case 3:
      return 'Connecting you to the blockchain where you can cast your votes';
    default:
      return 'Unknown step';
  }
}

interface Props {
  onSetupComplete: () => void;
}

export const LoadingPage: React.FC<Props> = ({onSetupComplete}) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const ctx = useUser();

  const checkLogin = async () => {
    await delay(2000);
    return true;
  };

  const createAccount = async () => {
    const web3 = await getWeb3();
    await delay(2000);
    const account = await web3.eth.personal.newAccount('securePassword');
    console.log(account);
    await web3.eth.personal.unlockAccount(account, 'securePassword', 1);
    web3.eth.defaultAccount = account;
  };

  const fundWallet = async () => {
    const web3 = await getWeb3();
    const token = localStorage.getItem('token');
    const wallet = web3.eth.defaultAccount;
    if (ctx !== null && token !== null && wallet !== null) {
      await ctx.fundWallet(token, wallet);
    }
  };

  const connectToContract = async () => {
    await delay(2000);
    // TODO: get contract address from backend
    // currently the contract is deployed manually and the address
    // added here manually
    const address = '0x702196b86Aed17A91EF58804B6345B359919812d';
    const web3 = await getWeb3();
    // TODO: abi should be fetched from the backend
    const contract = new web3.eth.Contract(SimpleStorage.abi, address);
    // const res = await contract.methods.get().call({from: web3.eth.defaultAccount});
    return true;
  };

  const nextStep = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  useEffect(() => {
    async function init() {
      await checkLogin();
      nextStep();
      await createAccount();
      nextStep();
      await fundWallet();
      nextStep();
      await connectToContract();
      onSetupComplete();
    }
    init();
  }, [fundWallet, onSetupComplete]);

  return (
    <Container maxWidth="xs">
      <Paper className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <strong>{label}</strong> {index === activeStep ? <CircularProgress size={20} /> : null}
              </StepLabel>
              <StepContent>
                <Typography>{getStepContent(index)}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default LoadingPage;
