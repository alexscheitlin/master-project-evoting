import { AppBar, Grid, makeStyles, Theme, Toolbar, Typography, Button } from '@material-ui/core';
import React from 'react';
import { useVoterStore } from '../store';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    flexGrow: 1,
  },
}));

export const Header: React.FC = () => {
  const classes = useStyles();
  const state = useVoterStore();

  return (
    <Grid item component="header">
      <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
            Voter Frontend
          </Typography>
          {state.isAuthenticated() && <Button onClick={state.logout}>Logout</Button>}
        </Toolbar>
      </AppBar>
    </Grid>
  );
};
