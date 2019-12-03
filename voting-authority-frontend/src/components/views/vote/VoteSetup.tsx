import { Button, Grid, makeStyles, TextField, Theme } from '@material-ui/core';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import React, { useState } from 'react';
import { DEV_URL } from '../../../constants';
import { useVoteQuestionStore } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';

interface Props {
  handleNext: () => void;
}

export const VoteSetup: React.FC<Props> = ({ handleNext }) => {
  const classes = useStyles();
  const [hasError, setError] = useState<boolean>(false);
  const { question, setQuestion } = useVoteQuestionStore();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(event.currentTarget.value);
  };

  const createVote = async () => {
    // avoids ssl error with certificate
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    try {
      const response: AxiosResponse = await axios.post(
        `${DEV_URL}/deploy`,
        { question: question },
        { httpsAgent: agent }
      );

      if (response.status === 201) {
        const res = response.data;
        console.log(res);

        // move to the next UI component
        handleNext();
      } else {
        setError(true);
        console.error(`Status: ${response.status}\nMessage: ${JSON.stringify(response.data)}`);
        throw new Error('Status Code not 201');
      }
    } catch (error) {
      // show error or popup
      setError(true);
      console.error(error);
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
        </Grid>
        <Grid item className={classes.actionsContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={createVote}
            className={classes.button}
            disabled={question.length < 5}
          >
            Create Vote
          </Button>
        </Grid>
        <ErrorSnackbar open={hasError} message={'Error - Request unsuccessful'} />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  vote: {
    margin: '0 1em 0 0'
  },
  container: {
    display: 'flex',
    alignItems: 'stretch'
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  }
}));
