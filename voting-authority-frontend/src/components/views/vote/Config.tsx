import { Button, makeStyles, Theme } from '@material-ui/core';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import React, { useState } from 'react';
import { DEV_URL } from '../../../constants';
import { useVoteStateStore, VotingState } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import { useInterval } from '../helper/UseInterval';

interface ConfigProps {
  handleNext: () => void;
}

interface ConfigStateReponse {
  state: VotingState;
  submittedKeyShares: number;
  requiredKeyShares: number;
}

export const Config: React.FC<ConfigProps> = ({ handleNext }: ConfigProps) => {
  const classes = useStyles();
  const REFRESH_INTERVAL_MS: number = 4000;

  const { nextState } = useVoteStateStore();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const [requiredKeyShares, setRequiredKeyShares] = useState<number>(1000);
  const [submittedKeyShares, setSubmittedKeyShares] = useState<number>(0);
  const [publicKeyGenerated, setPublicKeyGenerated] = useState<boolean>(false);

  const generatePublicKey = async () => {
    try {
      // avoids ssl error with certificate
      const agent = new https.Agent({
        rejectUnauthorized: false
      });

      const response: AxiosResponse<ConfigStateReponse> = await axios.post(
        `${DEV_URL}/keyshare`,
        {},
        {
          httpsAgent: agent
        }
      );

      if (response.status === 201) {
        setPublicKeyGenerated(true);
      } else {
        throw new Error(`GET /state -> status code not 200. Status code is: ${response.status}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setHasError(true);
    }
  };

  const checkNumberOfSubmittedPublicKeyShares = async () => {
    try {
      // avoids ssl error with certificate
      const agent = new https.Agent({
        rejectUnauthorized: false
      });

      const response: AxiosResponse<ConfigStateReponse> = await axios.get(`${DEV_URL}/state`, {
        httpsAgent: agent
      });

      if (response.status === 200) {
        setRequiredKeyShares(response.data.requiredKeyShares);
        setSubmittedKeyShares(response.data.submittedKeyShares);
      } else {
        throw new Error(`GET /state -> status code not 200. Status code is: ${response.status}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setHasError(true);
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
      checkNumberOfSubmittedPublicKeyShares();
      // TODO: Implement a way to end the setInterval
    },
    requiredKeyShares !== submittedKeyShares ? REFRESH_INTERVAL_MS : 0
  );

  return (
    <div className={classes.container}>
      <div>
        <h1>{`Vote Configuration Phase`}</h1>
        <h4>
          {`${submittedKeyShares}/${requiredKeyShares}: Public Key Shares have been submitted!`}
          {requiredKeyShares === submittedKeyShares
            ? publicKeyGenerated
              ? ` You can open the vote now!`
              : ` You can create the public key now!`
            : ``}
        </h4>
      </div>
      <div className={classes.actionsContainer}>
        {!publicKeyGenerated ? (
          <Button
            variant="contained"
            color="primary"
            onClick={generatePublicKey}
            className={classes.button}
            disabled={requiredKeyShares !== submittedKeyShares}
          >
            Generate Public Key
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={nextStep} className={classes.button}>
            Open Vote
          </Button>
        )}
      </div>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: '1em'
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  }
}));
