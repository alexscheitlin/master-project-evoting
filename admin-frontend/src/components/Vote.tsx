import React, { useState } from 'react';
import { Grid, Button, TextField, FormLabel } from '@material-ui/core';

export const Vote: React.FC = () => {
  const [question, setQuestion] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(event.currentTarget.value);
  };

  const sendToServer = () => {
    alert(question);
  };

  return (
    <div style={styles.wrapper}>
      <Grid container direction={'column'}>
        <Grid item>
          <h1>E-Voting Admin Backend</h1>
        </Grid>
        <Grid item>
          <Grid container direction={'column'}>
            <Grid item>
              <h2>Please enter a new question for the vote to be created?</h2>
            </Grid>
            <Grid item>
              <TextField
                style={styles.vote}
                label="Vote Question"
                variant="outlined"
                required
                onChange={handleInputChange}
              />
              <Button style={styles.vote} variant={'outlined'} color={'primary'} onClick={sendToServer}>
                Submit
              </Button>
              <FormLabel style={styles.vote}>{question}</FormLabel>
            </Grid>
          </Grid>
          <Grid container direction={'row'}></Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const styles = {
  vote: {
    margin: '0 1em 0 0'
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
};
