import { Button, makeStyles, Theme } from '@material-ui/core';
import axios, { AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { DEV_URL } from '../../../constants';
import { useVoteStateStore, VotingState } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import { useInterval } from '../helper/UseInterval';
import { fetchState } from '../../../services/authBackend';

interface ConfigProps {
  handleNext: () => void;
}

interface ConfigStateReponse {
  state: VotingState;
  submittedKeyShares: number;
  requiredKeyShares: number;
  publicKey: number;
}

interface PublicKeyPostResponse {
  msg: string;
  publicKey: number;
}

export const Config: React.FC<ConfigProps> = ({ handleNext }: ConfigProps) => {
  const classes = useStyles();
  const REFRESH_INTERVAL_MS: number = 4000;

  const { nextState } = useVoteStateStore();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const [requiredKeyShares, setRequiredKeyShares] = useState<number>(1000);
  const [submittedKeyShares, setSubmittedKeyShares] = useState<number>(0);

  const [publicKey, setPublicKey] = useState<number>(-2);
  const [publicKeyGenerated, setPublicKeyGenerated] = useState<boolean>(false);

  const generatePublicKey = async () => {
    try {
      const response: AxiosResponse<PublicKeyPostResponse> = await axios.post(`${DEV_URL}/publickey`, {});

      if (response.status === 201) {
        setPublicKey(response.data.publicKey);
        setPublicKeyGenerated(true);
      } else {
        throw new Error(`GET /state. Status Code: ${response.status} -> not what was expected.`);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.msg);
      setHasError(true);
    }
  };

  const checkNumberOfSubmittedPublicKeyShares = async () => {
    try {
      const data: ConfigStateReponse = (await fetchState()) as ConfigStateReponse;
      setRequiredKeyShares(data.requiredKeyShares);
      setSubmittedKeyShares(data.submittedKeyShares);

      if (data.publicKey > 0) {
        setPublicKey(data.publicKey);
        setPublicKeyGenerated(true);
      }
    } catch (error) {
      setErrorMessage(error.msg);
      setHasError(true);
    }
  };

  const nextStep = async () => {
    try {
      await nextState();
      handleNext();
    } catch (error) {
      setErrorMessage(error.msg);
      setHasError(true);
    }
  };

  // call request initially once before starting to poll with useInterval
  checkNumberOfSubmittedPublicKeyShares();

  useInterval(
    () => {
      checkNumberOfSubmittedPublicKeyShares();
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
        {publicKeyGenerated && <h3>{`The public key is: ${publicKey}`}</h3>}
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
