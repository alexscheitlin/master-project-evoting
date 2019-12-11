import { Button, FormLabel, Grid, makeStyles } from '@material-ui/core';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import React, { useState } from 'react';
import { DEV_URL } from '../../constants';
import { useVoteStateStore, VOTE_STATES } from '../../models/voting';

type StateResult = {
  state: string;
  msg: string;
};

export const State: React.FC = () => {
  const classes = useStyles();
  const { state, nextState } = useVoteStateStore();

  const changeVoteState = async () => {
    // avoids ssl error with certificate
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const response: AxiosResponse = await axios.post(`${DEV_URL}/state`, {}, { httpsAgent: agent });

    if (response.status === 201) {
      const res: StateResult = response.data;
      nextState();
    } else {
      console.error(`Status: ${response.status}\nMessage: ${JSON.stringify(response.data)}`);
    }
  };

  return (
    <Grid item className={classes.container}>
      <Grid item>
        <FormLabel className={classes.vote}>State of Vote: </FormLabel>
        <FormLabel className={classes.vote}>{state}</FormLabel>
      </Grid>
      <Button className={classes.vote} variant={'outlined'} color={'primary'} onClick={changeVoteState}>
        Change state to: {VOTE_STATES[(VOTE_STATES.indexOf(state) + 1) % VOTE_STATES.length]}
      </Button>
    </Grid>
  );
};

const useStyles = makeStyles({
  vote: {
    margin: '1em 0'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1em'
  }
});
