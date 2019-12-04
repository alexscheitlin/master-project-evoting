import React from 'react';
import { Button, createStyles, makeStyles, Theme } from '@material-ui/core';
import { useVoteStateStore } from '../../../models/voting';

interface Props {
  handleNext: () => void;
}

export const Register: React.FC<Props> = ({ handleNext }: Props) => {
  const classes = useStyles();
  const selears = ['1', 's'];
  const { state, nextState } = useVoteStateStore();

  const nextStep = () => {
    handleNext();
  };

  return (
    <div className={classes.container}>
      <h1>Sealer Node Registration Phase</h1>
      {selears.map(selear => (
        <div>{selear}</div>
      ))}

      <div>{state}</div>
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
