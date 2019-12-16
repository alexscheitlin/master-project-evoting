import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  TextField,
  Theme
} from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import SendIcon from '@material-ui/icons/Send';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';

import { DEV_URL } from '../../../constants';
import { useVoteQuestionStore, useVoteStateStore, VotingState } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import { StepContentWrapper } from '../../defaults/StepContentWrapper';
import { StepTitle } from '../../defaults/StepTitle';
import { LoadSuccess } from '../helper/LoadSuccess';
import { useInterval } from '../helper/UseInterval';

interface StartupProps {
  requiredSealers: number;
  handleNext: () => void;
}

interface StartupStateResponse {
  state: VotingState;
  connectedSealers: number;
  signedUpSealers: number;
  requiredSealers: number;
  question: string;
}

interface VoteDeployResponse {
  address: string;
  message: string;
}

export const Startup: React.FC<StartupProps> = ({ requiredSealers, handleNext }: StartupProps) => {
  const classes = useStyles();
  const REFRESH_INTERVAL_MS: number = 4000;

  const { nextState } = useVoteStateStore();
  const { question, setQuestion } = useVoteQuestionStore();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [connectedSealers, setConnectedSealers] = useState<number>(0);
  const [signedUpSealers, setSignedUpSealers] = useState<number>(0);

  const [readyForDeployment, setReadyForDeployment] = useState(false);

  const [voteQuestionDeployed, setVoteQuestionDeployed] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    // load page data on component mount
    checkNumberOfAuthoritiesOnline();
  }, []);

  useEffect(() => {
    // check if the contract is already deployed
    // if yes, get the needed information for the UI
    checkIfContractDeployed();
  }, []);

  const checkIfContractDeployed = async () => {
    try {
      const response = await axios.get(`${DEV_URL}/deploy`);
      if (response.status === 200 && response.data.address !== '') {
        setVoteQuestionDeployed(true);
        setAddress(response.data.address);
        const state: AxiosResponse<StartupStateResponse> = await axios.get(`${DEV_URL}/state`);
        setQuestion(state.data.question);
      }
    } catch (error) {}
  };

  const checkNumberOfAuthoritiesOnline = async () => {
    try {
      const response: AxiosResponse<StartupStateResponse> = await axios.get(`${DEV_URL}/state`);

      if (response.status === 200) {
        setSignedUpSealers(response.data.signedUpSealers);
        setConnectedSealers(response.data.connectedSealers);

        setReadyForDeployment(response.data.signedUpSealers === response.data.connectedSealers);

        // check if the voteQuestion has been deployed i.e. exists on the backend
        // TODO: check why this fails sometimes
        // if (typeof response.data.question !== undefined && response.data.question !== '') {
        //   setQuestion(response.data.question);
        //   setVoteQuestionDeployed(true);
        // }
      } else {
        throw new Error(`GET /state -> status code not 200. Status code is: ${response.status}`);
      }
    } catch (error) {
      setHasError(true);
      setErrorMessage(error.message);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(event.currentTarget.value);
  };

  const createVote = async () => {
    try {
      setLoading(true);
      const response: AxiosResponse<VoteDeployResponse> = await axios.post(`${DEV_URL}/deploy`, { question: question });

      if (response.status === 201) {
        setAddress(response.data.address);
        setVoteQuestionDeployed(true);
        setLoading(false);
      } else {
        throw new Error(`Unable to deploy vote! Status: ${response.status}\nMessage: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      // show error or popup
      setLoading(false);
      setHasError(true);
      setErrorMessage(error.msg);
      console.error(error);
    }
  };

  const nextStep = async () => {
    try {
      await nextState();
      handleNext();
    } catch (error) {
      setErrorMessage(error.message);
      setHasError(true);
    }
  };

  useInterval(
    () => {
      checkNumberOfAuthoritiesOnline();
    },
    connectedSealers !== requiredSealers || signedUpSealers !== requiredSealers ? REFRESH_INTERVAL_MS : 10000000
  );

  return (
    <StepContentWrapper>
      <StepTitle title="Contract Deployment" />
      <List>
        <ListItem>
          <ListItemIcon>
            <SettingsEthernetIcon />
          </ListItemIcon>
          <ListItemText primary={`currently ${signedUpSealers}/${requiredSealers} sealers have signed up`} />
        </ListItem>
        {!voteQuestionDeployed && (
          <ListItem>
            <ListItemIcon>
              <LoadSuccess loading={!readyForDeployment} success={readyForDeployment} />
            </ListItemIcon>
            <ListItemText
              primary={
                readyForDeployment
                  ? `all sealers registered, you can now deploy the contrat`
                  : `please wait until all sealers have registered to deploy the contract`
              }
            />
          </ListItem>
        )}

        {!voteQuestionDeployed && (
          <ListItem>
            <TextField fullWidth label="Enter Vote Question" variant="outlined" required onChange={handleInputChange} />
            {loading ? (
              <IconButton disabled={true}>
                <LoadSuccess success={success} loading={loading} />
              </IconButton>
            ) : (
              <IconButton onClick={createVote} disabled={!(readyForDeployment && question.length > 5)}>
                <SendIcon color={!(readyForDeployment && question.length > 5) ? 'disabled' : 'primary'} />
              </IconButton>
            )}
          </ListItem>
        )}
      </List>

      {voteQuestionDeployed && (
        <List>
          <ListItem>
            <ListItemIcon>
              <LoadSuccess success={true} />
            </ListItemIcon>
            <ListItemText primary={`Vote Question Successfully Deployed`} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <AccountBalanceWalletIcon />
            </ListItemIcon>
            <ListItemText primary={`${address}`} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <QuestionAnswerIcon />
            </ListItemIcon>
            <ListItemText primary={`${question}`} />
          </ListItem>
        </List>
      )}

      <List className={classes.nextButton}>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            onClick={nextStep}
            className={classes.button}
            disabled={!voteQuestionDeployed}
          >
            Next Step
          </Button>
        </ListItem>
      </List>

      <div className={classes.container}>{hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}</div>
    </StepContentWrapper>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  questionContainer: {
    padding: '0.5rem',
    elevation: 2
  },
  button: {
    marginRight: theme.spacing(1),
    width: 160
  },
  nextButton: {
    position: 'absolute',
    bottom: 0
  }
}));
