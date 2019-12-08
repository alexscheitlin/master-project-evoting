import { Button, makeStyles, Theme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { DEV_URL } from '../../../constants';
import { useVoteStateStore, VotingState } from '../../../models/voting';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';

interface Props {
  handleNext: () => void;
}

interface Validators {
  items: string[];
}

interface StateResponse {
  state: VotingState;
  registeredSealers: number;
  requiredSealers: number;
}

const List: React.FC<Validators> = ({ items }: Validators) => (
  <div>
    {items.length > 0 && (
      <ul>
        {items.map((item: string) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )}
  </div>
);

export const Register: React.FC<Props> = ({ handleNext }: Props) => {
  const classes = useStyles();

  const { state, nextState, setState } = useVoteStateStore();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const [requiredSealers, setRequiredSealers] = useState<number>(3);
  const [sealers, setSealers] = useState<string[]>([]);
  const [listening, setListening] = useState<boolean>(false);

  const [readyForNextStep, setReadyForNextStep] = useState<boolean>(false);

  useEffect(() => {
    setReadyForNextStep(requiredSealers !== sealers.length);
  }, [sealers, requiredSealers]);

  useEffect(() => {
    const getRequiredValidators = async () => {
      try {
        // avoids ssl error with certificate
        const agent = new https.Agent({
          rejectUnauthorized: false
        });
        const response: AxiosResponse<StateResponse> = await axios.get(`${DEV_URL}/state`, { httpsAgent: agent });
        if (response.status === 200) {
          setRequiredSealers(response.data.requiredSealers);
          setState(response.data.state);
        } else {
          throw new Error(`GET /state -> status code not 200. Status code is: ${response.status}`);
        }
      } catch (error) {
        setErrorMessage(error.message);
        setHasError(true);
      }
    };

    getRequiredValidators();
  }, []);

  useEffect(() => {
    if (!listening) {
      const events = new EventSource(`${DEV_URL}/registered`);
      events.onmessage = event => {
        const parsedData = JSON.parse(event.data);
        setSealers(sealers => sealers.concat(parsedData));
      };

      setListening(true);
    }
  }, [listening, sealers]);

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
        <h1>Sealer Node Registration Phase</h1>
        <div>{`The state is: ${state}`}</div>
        <h2>{`${sealers.length}/${requiredSealers}: Sealears are registered!`}</h2>
        <List items={sealers} />
      </div>
      <div className={classes.actionsContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={nextStep}
          className={classes.button}
          disabled={readyForNextStep}
        >
          Next Step
        </Button>
      </div>
      <ErrorSnackbar open={hasError} message={errorMessage} />
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
