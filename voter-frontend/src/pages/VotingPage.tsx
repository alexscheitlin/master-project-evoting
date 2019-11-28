import React from 'react';
import {Grid} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import Question from '../components/Question/Question';

const useStyles = makeStyles(theme => ({
  question: {
    height: '30%',
    border: '1px solid red',
  },
  chain: {
    height: '20%',
    border: '1px solid blue',
  },
  voting: {
    height: '50%',
    border: '1px solid green',
  },
}));

const VotingPage: React.FC = () => {
  const classes = useStyles();
  return (
    <Grid container direction="column" style={{height: '100%'}}>
      <Grid item className={classes.question}>
        <Question />
      </Grid>
      <Grid item className={classes.chain}>
        Chain Information
      </Grid>
      <Grid item className={classes.voting}>
        Voting Panel
      </Grid>
    </Grid>
  );
};

export default VotingPage;
