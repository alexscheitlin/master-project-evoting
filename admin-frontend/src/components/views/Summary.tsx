import { Grid, makeStyles } from '@material-ui/core';
import React from 'react';

export const Summary: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid container component="main" direction={'column'} className={classes.mainContainer}>
      <Grid item>
        <h1>This is going to be the summary view.</h1>
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
