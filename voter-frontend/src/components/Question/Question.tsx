import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles(() => ({
  divider: {
    margin: '1em auto',
    paddingTop: '1em',
  },
}));

interface Props {
  votingQuestion: string;
}

const Question: React.FC<Props> = ({ votingQuestion }) => {
  const classes = useStyles();
  return (
    <Grid container direction="column" justify="center">
      <Grid item>
        <Box textAlign="center">
          <Typography variant="h2">{votingQuestion}</Typography>
        </Box>
      </Grid>
      <Grid item>
        <Box textAlign="center" className={classes.divider}>
          <Typography variant="h5">Abstimmung vom 2. Februar 2019</Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Question;
