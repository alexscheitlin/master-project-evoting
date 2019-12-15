import React, { useState, useEffect } from 'react';

import LoginPage from './pages/LoginPage';
import VotingPage from './pages/VotingPage';
import { useVoterStore } from './store';
import LoadingPage from './pages/LoadingPage';
import { Grid, makeStyles } from '@material-ui/core';

const AppManager: React.FC = () => {
  const classes = useStyles();
  const state = useVoterStore();

  const setupDone = () => {
    return state.isAuthenticated() && state.isTokenSet() && state.isWalletSet() && state.isBallotContractAddressSet();
  };

  // check what values are already in local storage
  useEffect(() => {
    if (state.isAuthenticated()) {
      state.setAuthenicated(true);
    }

    if (state.isTokenSet()) {
      state.setToken(state.getToken());
    }

    if (state.isWalletSet()) {
      state.setWallet(state.getWallet());
    }

    if (state.isBallotContractAddressSet()) {
      state.setBallotContractAddress(state.getBallotContractAddress());
    }
  }, []);

  const getPage = () => {
    if (!state.authenticated) {
      return <LoginPage />;
    } else if (!setupDone()) {
      return <LoadingPage />;
    } else {
      return <VotingPage />;
    }
  };

  // LoginPage displays the login form per default
  // once the user submits her details, the LoginPage shows the LoadingPage
  // once everything is laoded correctly, the VotingPage is displayed
  return (
    <Grid container alignItems="center" justify="center" className={classes.item}>
      {getPage()}
    </Grid>
  );
};

export default AppManager;

const useStyles = makeStyles({
  item: {
    flexGrow: 1,
  },
});
