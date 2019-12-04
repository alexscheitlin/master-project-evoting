import { Button, makeStyles, Theme } from '@material-ui/core';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import React from 'react';
import { DEV_URL } from '../../../constants';
import { useVoteStateStore } from '../../../models/voting';

interface Props {
  handleNext: () => void;
}

export const Tally: React.FC<Props> = ({ handleNext }) => {
  const classes = useStyles();
  const { state, nextState } = useVoteStateStore();

  const endVote = async () => {
    // avoids ssl error with certificate
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    try {
      const response: AxiosResponse = await axios.post(
        `${DEV_URL}/state`,
        { state: 'POST_VOTING' },
        { httpsAgent: agent }
      );

      if (response.status === 201) {
        const res = response.data;
        console.log(res);

        // trigger a global voteState update if request was successful
        nextState();
        handleNext();
      } else {
        console.error(`Status: ${response.status}\nMessage: ${JSON.stringify(response.data)}`);
        throw new Error('Status Code not 201');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={classes.container}>
      <h1>{`The state of the vote is: ${state}`}</h1>
      <p>{state}</p>
      <div className={classes.actionsContainer}>
        <Button variant="contained" color="primary" onClick={endVote} className={classes.button}>
          End Vote
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
