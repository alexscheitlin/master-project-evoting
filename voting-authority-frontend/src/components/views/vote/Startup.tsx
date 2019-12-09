import { Button, makeStyles, Theme, Grid, TextField } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
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

export const Startup: React.FC<StartupProps> = ({ requiredSealers, handleNext }: StartupProps) => {
  const classes = useStyles();
  const REFRESH_INTERVAL_MS: number = 4000;

  const { state, nextState } = useVoteStateStore();
  const { question, setQuestion } = useVoteQuestionStore();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const [connectedSealers, setConnectedSealers] = useState<number>(0);
  const [voteQuestionDeployed, setVoteQuestionDeployed] = useState<boolean>(false);

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

  useInterval(() => {
    checkNumberOfAuthoritiesOnline();
    // TODO: Implement a way to end the setInterval
  }, REFRESH_INTERVAL_MS);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(event.currentTarget.value);
  };

  const createVote = async () => {
    // avoids ssl error with certificate
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    try {
      const response: AxiosResponse = await axios.post(
        `${DEV_URL}/deploy`,
        { question: question },
        { httpsAgent: agent }
      );

      if (response.status === 201) {
        const res = response.data;
        setVoteQuestionDeployed(true);
        // TODO: Display that vote has been deployed
      } else {
        throw new Error(`Unable to deploy vote! Status: ${response.status}\nMessage: ${JSON.stringify(response.data)}`);
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

  return (
    <div className={classes.container}>
      <div>
        <h1>{`Vote Startup Phase - Current State: ${state}`}</h1>
        <h2>{`${connectedSealers}/${requiredSealers}: Authorities are online!`}</h2>
        <Grid container direction={'column'}>
          <Grid item>
            <h2>Please enter a new question for the vote to be created?</h2>
          </Grid>
          <Grid item>
            <TextField label="Vote Question" variant="outlined" required onChange={handleInputChange} />
          </Grid>
          <Grid item className={classes.actionsContainer}>
            <Button
              variant="contained"
              color="primary"
              onClick={createVote}
              className={classes.button}
              disabled={connectedSealers === 0 || question.length < 5}
            >
              Create Vote
            </Button>
          </Grid>
        </Grid>
      </div>
      <div className={classes.actionsContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={nextStep}
          className={classes.button}
          disabled={!voteQuestionDeployed || requiredSealers !== connectedSealers}
        >
          Next Step
        </Button>
      </div>
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
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  }
}));
