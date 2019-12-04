import { Button, makeStyles, Theme } from '@material-ui/core';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import React from 'react';
import { DEV_URL } from '../../../constants';
import { useVoteStateStore, useVoteQuestionStore } from '../../../models/voting';

interface Props {
  handleNext: () => void;
}

export const Vote: React.FC<Props> = ({ handleNext }) => {
  const classes = useStyles();
  const { state, nextState } = useVoteStateStore();
  const { question } = useVoteQuestionStore();

  const openVote = async () => {
    // avoids ssl error with certificate
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    try {
      const response: AxiosResponse = await axios.post(`${DEV_URL}/state`, { state: 'VOTING' }, { httpsAgent: agent });

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
    <div>
      <p>{state}</p>
      <p>{question}</p>
      <div className={classes.actionsContainer}>
        <Button variant="contained" color="primary" onClick={openVote} className={classes.button}>
          Open Vote
        </Button>
      </div>
    </div>
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
