import { Box, Grid, Link, makeStyles, Typography, Theme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2)
  }
}));

export const Footer: React.FC = () => {
  const classes = useStyles();
  return (
    <Grid item component="footer" className={classes.footer}>
      <Box mt={1}>
        <Typography variant="body2" color="textSecondary" align="center">
          {'Copyright © '}
          <Link color="inherit" target="_blank" href="https://github.com/nikzaugg">
            Nik Zaugg
          </Link>{' '}
          <Link color="inherit" target="_blank" href="https://github.com/alexscheitlin">
            Alex Scheitlin
          </Link>{' '}
          <Link color="inherit" target="_blank" href="https://github.com/meck93">
            Moritz Eck
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Box>
    </Grid>
  );
};
