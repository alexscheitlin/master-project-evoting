import { Grid, makeStyles } from '@material-ui/core';
import React from 'react';

import { useVoteStateStore } from '../../models/voting';

export const Summary: React.FC = () => {
  const classes = useStyles();

  const { state } = useVoteStateStore();

  return (
    <Grid container component="main" direction={'column'} className={classes.mainContainer}>
      <Grid item>
        <h1>This is going to be the summary view.</h1>
        <p>{`The current state of the vote is: ${state}`}</p>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles({
  mainContainer: {
    padding: '1em',
    flexGrow: 1
  }
});
