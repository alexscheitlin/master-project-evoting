import React from 'react';
import { Box, Typography, Grid } from '@material-ui/core';

interface Props {
  votingQuestion: string;
}

const Question: React.FC<Props> = ({ votingQuestion }) => {
  return (
    <Grid container direction="column" justify="center">
      <Grid item>
        <Box textAlign="center">
          <Typography variant="h1">{votingQuestion}</Typography>
        </Box>
      </Grid>
      <Grid item>
        <Box textAlign="center">
          <Typography variant="h5">2. Februar 2019</Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Question;
