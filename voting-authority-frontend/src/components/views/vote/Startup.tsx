import { Button, makeStyles, Theme, Paper, TextField, CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';
import { useVoteStateStore, VotingState, useVoteQuestionStore } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import https from 'https';
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
  requiredSealers: number;
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
  const [voteQuestionDeployed, setVoteQuestionDeployed] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');

  const checkNumberOfAuthoritiesOnline = async () => {
    try {
      // avoids ssl error with certificate
      const agent = new https.Agent({
        rejectUnauthorized: false
      });

      const response: AxiosResponse<StartupStateResponse> = await axios.get(`${DEV_URL}/state`, {
        httpsAgent: agent
      });

      if (response.status === 200) {
        setConnectedSealers(response.data.connectedSealers);
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
    // avoids ssl error with certificate
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    try {
      setLoading(true);

      const response: AxiosResponse<VoteDeployResponse> = await axios.post(
        `${DEV_URL}/deploy`,
        { question: question },
        { httpsAgent: agent }
      );

      setLoading(false);

      if (response.status === 201) {
        setAddress(response.data.address);
        setVoteQuestionDeployed(true);
      } else {
        throw new Error(`Unable to deploy vote! Status: ${response.status}\nMessage: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      // show error or popup
      setHasError(true);
      setErrorMessage(error.message);
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
      // TODO: Implement a way to end the setInterval
    },
    connectedSealers !== requiredSealers ? REFRESH_INTERVAL_MS : 0
  );

  return (
    <div className={classes.container}>
      <div>
        <h1>{`Vote Startup Phase: Create and Deploy the Voting Question`}</h1>
        <h4>
          {`${connectedSealers}/${requiredSealers}: Authorities are online!`}
          {requiredSealers === connectedSealers && ` You can deploy the vote question now!`}
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
                  disabled={connectedSealers !== requiredSealers || question.length < 5}
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
      {voteQuestionDeployed && requiredSealers === connectedSealers && (
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
