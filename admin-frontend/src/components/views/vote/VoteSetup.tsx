import { Button, FormLabel, Grid, makeStyles, TextField } from '@material-ui/core';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import React from 'react';
import { useStore } from '../../../models/voting';

import { DEV_URL } from '../../../constants';

interface Props {
  votingQuestion: string;
  setVoteQuestion: (question: string) => void;
}

export const VoteSetup: React.FC<Props> = ({ votingQuestion, setVoteQuestion }) => {
  const isButtonDisabled: boolean = votingQuestion.length < 5;
  const classes = useStyles();
  const { nextState } = useStore();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoteQuestion(event.currentTarget.value);
  };

  const sendVoteQuestionToBackend = async () => {
    // avoids ssl error with certificate
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const response: AxiosResponse = await axios.post(
      `${DEV_URL}/deploy`,
      { question: votingQuestion },
      { httpsAgent: agent }
    );

    if (response.status === 201) {
      const res = response.data;
      console.log(res);

      // trigger a global voteState update if request was successful
      nextState();
    } else {
      console.error(`Status: ${response.status}\nMessage: ${JSON.stringify(response.data)}`);
    }
  };

  return (
    <Grid item>
      <Grid container direction={'column'}>
        <Grid item className={classes.container}>
          <h2>Please enter a new question for the vote to be created?</h2>
        </Grid>
        <Grid item className={classes.container}>
          <TextField
            className={classes.vote}
            label="Vote Question"
            variant="outlined"
            required
            onChange={handleInputChange}
          />
          <Button
            className={classes.vote}
            variant={'outlined'}
            color={'primary'}
            onClick={sendVoteQuestionToBackend}
            disabled={isButtonDisabled}
          >
            Create Vote
          </Button>
          <FormLabel className={classes.vote}>{votingQuestion}</FormLabel>
        </Grid>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles({
  vote: {
    margin: '0 1em 0 0'
  },
  container: {
    display: 'flex',
    alignItems: 'stretch'
  }
});
