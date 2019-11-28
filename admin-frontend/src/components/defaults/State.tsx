import { Button, FormLabel, Grid, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import { DEV_URL } from '../../constants';

type StateResult = {
  state: string;
  msg: string;
};

export const State: React.FC = () => {
  const classes = useStyles();
  const VOTE_STATES: string[] = ['PRE_VOTING', 'VOTING', 'POST_VOTING'];
  const [voteState, setVoteState] = useState<string>(VOTE_STATES[0]);

  const nextVoteState = (): string => {
    return VOTE_STATES[(VOTE_STATES.indexOf(voteState) + 1) % VOTE_STATES.length];
  };

  const changeVoteState = async () => {
    const newState: string = nextVoteState();

    // avoids ssl error with certificate
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const response: AxiosResponse = await axios.post(`${DEV_URL}/state`, { state: newState }, { httpsAgent: agent });

    if (response.status === 200) {
      const res: StateResult = response.data;
      setVoteState(res.state);
    } else {
      console.error(`Status: ${response.status}\nMessage: ${response.data}`);
    }
  };

  return (
    <Grid item className={classes.container}>
      <Grid item>
        <FormLabel className={classes.vote}>State of Vote: </FormLabel>
        <FormLabel className={classes.vote}>{voteState}</FormLabel>
      </Grid>
      <Button className={classes.vote} variant={'outlined'} color={'primary'} onClick={changeVoteState}>
        Change state to: {nextVoteState()}
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
