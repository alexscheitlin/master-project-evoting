import { Button, makeStyles, Theme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { DEV_URL } from '../../../constants';
import { useVoteStateStore } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import { LoadSuccess } from '../helper/LoadSuccess';
import { List } from '../helper/List';

interface RegisterProps {
  requiredSealers: number;
  handleNext: () => void;
}

export const Register: React.FC<RegisterProps> = ({ requiredSealers, handleNext }: RegisterProps) => {
  const classes = useStyles();

  const { nextState } = useVoteStateStore();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [sealers, setSealers] = useState<string[]>([]);
  const [listening, setListening] = useState<boolean>(false);

  const [buttonActive, setButtonActive] = useState<boolean>(false);

  useEffect(() => {
    setButtonActive(requiredSealers !== sealers.length);
  }, [sealers, requiredSealers]);

  useEffect(() => {
    if (!listening) {
      const events = new EventSource(`${DEV_URL}/registered`);
      events.onmessage = event => {
        const parsedData = JSON.parse(event.data);
        setSealers(sealers =>
          sealers.concat(parsedData).filter((element, index, arr) => arr.indexOf(element) === index)
        );
      };

      setListening(true);
    }
  }, [listening, sealers]);

  const nextStep = async () => {
    try {
      setLoading(true);

      await nextState();

      setLoading(false);
      setSuccess(true);

      handleNext();
    } catch (error) {
      setErrorMessage(error.message);
      setHasError(true);
    }
  };

  return (
    <div className={classes.container}>
      <div>
        <h1>{`Sealer Registration`}</h1>
        <h3>
          {`${sealers.length}/${requiredSealers}: Sealears are registered!`}
          {sealers.length !== requiredSealers
            ? ` Please wait for all selears to be registered!`
            : ` All sealers are registered, you can proceed to the next step!`}
        </h3>
        <List items={sealers} />
      </div>
      <div className={classes.actionsContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={nextStep}
          className={classes.button}
          disabled={buttonActive}
        >
          Next Step
        </Button>
        <LoadSuccess success={success} loading={loading} />
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
