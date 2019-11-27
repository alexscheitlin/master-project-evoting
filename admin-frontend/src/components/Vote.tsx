import { Button, CssBaseline, FormLabel, Grid, makeStyles, TextField } from '@material-ui/core';
import React, { useState } from 'react';
import { Header } from './Header';

export const Vote: React.FC = () => {
  const [question, setQuestion] = useState<string>('');

  const classes = useStyles();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(event.currentTarget.value);
  };

  const sendToServer = () => {
    alert(question);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Grid container direction={'column'}>
        <Header />
        <Grid item>
          <Grid container direction={'column'}>
            <Grid item>
              <h2>Please enter a new question for the vote to be created?</h2>
            </Grid>
            <Grid item>
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
          <Grid container direction={'row'}></Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const useStyles = makeStyles({
  vote: {
    margin: '0 1em 0 0'
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
