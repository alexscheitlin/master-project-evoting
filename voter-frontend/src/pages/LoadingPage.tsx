import { CircularProgress, Container } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

import BallotContract from '../contract-abis/Ballot.json';
import { AccessProviderService } from '../services';
import { useVoterStore } from '../store';
import getWeb3 from '../util/getWeb3';
import { delay } from '../util/helper';

// The 4 things that are checked inside this component
function getSteps(): string[] {
  return ['Checking your Login', 'Creating Voter Account', 'Setting up Wallet', 'Connect to Blockchain'];
}

// The descriptions for each step of this component
function getStepContent(step: number): string {
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

export const LoadingPage: React.FC<Props> = ({ onSetupComplete }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const voterState = useVoterStore();

  const LOADING_DELAY = 1000;

  const checkLogin = async (): Promise<any> => {
    await delay(LOADING_DELAY);
    return true;
  };

  const createAccount = async (web3: Web3): Promise<string> => {
    await delay(LOADING_DELAY);
    try {
      const account = await web3.eth.personal.newAccount('securePassword');
      //@ts-ignore
      await web3.eth.personal.unlockAccount(account, 'securePassword', null);
      voterState.setWallet(account);
      return account;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  };

  const fundWallet = async (account: string): Promise<string> => {
    await delay(LOADING_DELAY);
    try {
      const ballotAddress = await AccessProviderService.fundWallet(voterState.token, account);
      voterState.setBallotContractAddress(ballotAddress);
      return ballotAddress;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  };

  const connectToContract = async (web3: Web3, ballot: string): Promise<any> => {
    await delay(LOADING_DELAY);
    try {
      //@ts-ignore
      const contract = new web3.eth.Contract(BallotContract.abi, ballot);
      voterState.setContract(contract);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  };

  const nextStep = (): void => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  useEffect(() => {
    // ------------------------------
    // Setup function
    // ------------------------------
    // go through every step of the loading process
    // - create account
    // -
    async function setup(): Promise<any> {
      const connectionURL = await AccessProviderService.getConnectionNodeUrl();
      voterState.setConnectionNodeUrl(connectionURL);
      const web3: Web3 = await getWeb3(connectionURL);
      await checkLogin();
      nextStep();
      const account = await createAccount(web3);
      nextStep();
      const ballot = await fundWallet(account);
      nextStep();
      await connectToContract(web3, ballot);
    }

    setup().then(() => onSetupComplete());
    return (): void => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      marginTop: theme.spacing(16),
    },
  }),
);
