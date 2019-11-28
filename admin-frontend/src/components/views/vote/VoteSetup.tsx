import { Button, FormLabel, Grid, makeStyles, TextField } from '@material-ui/core';
import React, { useState } from 'react';

export const VoteSetup: React.FC = () => {
  const [question, setQuestion] = useState<string>('');

  const classes = useStyles();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(event.currentTarget.value);
  };

  const sendToServer = () => {
    alert(question);
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
          <Button className={classes.vote} variant={'outlined'} color={'primary'} onClick={sendToServer}>
            Submit
          </Button>
          <FormLabel className={classes.vote}>{question}</FormLabel>
        </Grid>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  vote: {
    margin: '0 1em 0 0'
  },
  container: {
    display: 'flex',
    alignItems: 'stretch',
    padding: '1em'
  },
  mainContainer: {
    padding: '1em'
  }
}));
