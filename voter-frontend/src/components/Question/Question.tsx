import React from 'react';
import { Box, Typography, Grid } from '@material-ui/core';

const Question: React.FC = () => {
  return (
    <Grid container direction="column" justify="center">
      <Grid item>
        <Box textAlign="center">
          <Typography variant="h1">Lorem ipsum dolor sit amet, consetetur sadipscing elitr?</Typography>
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
