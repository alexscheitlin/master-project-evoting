import { Button, makeStyles, Theme, Paper, TextField, CircularProgress } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useVoteStateStore, VotingState, useVoteQuestionStore } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import axios, { AxiosResponse } from 'axios';
import { DEV_URL } from '../../../constants';
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

  const [isLoading, setLoading] = useState<boolean>(false);

  const [connectedSealers, setConnectedSealers] = useState<number>(0);
  const [signedUpSealers, setSignedUpSealers] = useState<number>(0);

  const [canVoteBeDeployed, setCanVoteBeDeployed] = useState<boolean>(false);
  const [voteQuestionDeployed, setVoteQuestionDeployed] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');

  const checkNumberOfAuthoritiesOnline = async () => {
    try {
      const response: AxiosResponse<StartupStateResponse> = await axios.get(`${DEV_URL}/state`);

      if (response.status === 200) {
        setSignedUpSealers(response.data.signedUpSealers);
        setConnectedSealers(response.data.connectedSealers);

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
      setErrorMessage(error.message);
      setHasError(true);
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

  useEffect(() => {
    const canVoteBeDeployed: boolean = !(
      signedUpSealers === requiredSealers &&
      connectedSealers === requiredSealers &&
      question.length > 5
    );
    // TODO: check why question.length fails sometimes
    setCanVoteBeDeployed(canVoteBeDeployed);
  }, [signedUpSealers, requiredSealers, connectedSealers, question]);

  const nextStep = async () => {
    try {
      // TODO: Set loading animation
      await nextState();
      handleNext();
    } catch (error) {
      setErrorMessage(error.message);
      setHasError(true);
    }
  };

  // call request initially once before starting to poll with useInterval
  checkNumberOfAuthoritiesOnline();

  useInterval(
    () => {
      checkNumberOfAuthoritiesOnline();
    },
    connectedSealers !== requiredSealers || signedUpSealers !== requiredSealers ? REFRESH_INTERVAL_MS : 10000000
  );

  return (
    <div className={classes.container}>
      <div>
        <h1>{`Vote Startup Phase: Create and Deploy the Voting Question`}</h1>
        <h4>
          {`${signedUpSealers}/${requiredSealers}: Authorities have signed up!`}
          {requiredSealers === connectedSealers &&
            signedUpSealers === requiredSealers &&
            ` You can deploy the vote question now!`}
        </h4>
        <Paper className={classes.questionContainer}>
          {isLoading ? (
            <div>
              <h3>{`Your vote question is currently being deployed.`}</h3>
              <CircularProgress />
            </div>
          ) : !voteQuestionDeployed ? (
            <div>
              <h3>Please enter a new question for the vote to be created?</h3>
              <TextField label="Vote Question" variant="outlined" required onChange={handleInputChange} />
              <div className={classes.actionsContainer}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={createVote}
                  className={classes.button}
                  disabled={canVoteBeDeployed}
                >
                  Create Votequestion
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h3>{`Vote Question Successfully Deployed!`}</h3>
              <ul>
                <li>{`Address: ${address}`}</li>
                <li>{`Question: ${question}`}</li>
              </ul>
            </div>
          )}
        </Paper>
      </div>
      {voteQuestionDeployed && (
        <div className={classes.actionsContainer}>
          <Button variant="contained" color="primary" onClick={nextStep} className={classes.button}>
            Next Step
          </Button>
        </div>
      )}
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </div>
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
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  }
}));
