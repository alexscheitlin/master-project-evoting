import React from 'react';

import AppManager from './AppManager';
import AppWrapper from './components/Layout/AppWrapper/AppWrapper';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { CssBaseline, makeStyles, Grid } from '@material-ui/core';

const App: React.FC = () => {
  const classes = useStyles();

  return (
    <AppWrapper>
      <CssBaseline />
      <Grid container direction={'column'} className={classes.wrapper}>
        <Header />
        <AppManager />
        <Footer />
      </Grid>
    </AppWrapper>
  );
};

export default App;

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    height: '100vh',
  },
});
