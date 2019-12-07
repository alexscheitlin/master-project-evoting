import { Button, makeStyles, Theme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { DEV_URL } from '../../../constants';
import { useVoteStateStore } from '../../../models/voting';

interface Props {
  handleNext: () => void;
}

interface Validators {
  items: string[];
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

  const [validators, setValidators] = useState<string[]>([]);
  const [listening, setListening] = useState(false);

  const { state, nextState } = useVoteStateStore();

  useEffect(() => {
    if (!listening) {
      const events = new EventSource(`${DEV_URL}/registered`);
      events.onmessage = event => {
        const parsedData = JSON.parse(event.data);
        console.log('parsed data:', parsedData);
        setValidators([...validators, ...parsedData]);
      };

      setListening(true);
    }
  }, [listening, validators]);

  const nextStep = () => {
    handleNext();
    nextState();
  };

  return (
    <div className={classes.container}>
      <div>
        <h1>Sealer Node Registration Phase</h1>
        <div>{`The state is: ${state}`}</div>
        <h2>List of registered Validators</h2>
        <List items={validators} />
      </div>
      <div className={classes.actionsContainer}>
        <Button variant="contained" color="primary" onClick={nextStep} className={classes.button}>
          Next Step
        </Button>
      </div>
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
