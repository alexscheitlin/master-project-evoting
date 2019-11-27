import { Button, FormLabel, Grid, makeStyles, TextField, Divider } from '@material-ui/core';
import React, { useState } from 'react';
import { State } from './State';

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
    <Grid container component="main" direction={'column'} className={classes.mainContainer}>
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
          <Divider orientation="vertical" className={classes.divider} />
          <State />
        </Grid>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  divider: {
    borderTop: `1px solid ${theme.palette.divider}`
  },
  vote: {
    margin: '0 1em 0 0'
  },
  container: {
    display: 'flex',
    alignItems: 'stretch',
    padding: '1em'
  },
  mainContainer: {
    padding: '1em',
    flexGrow: 1
  }
}));
