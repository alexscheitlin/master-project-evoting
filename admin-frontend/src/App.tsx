import { CssBaseline, Grid, makeStyles } from '@material-ui/core';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Footer } from './components/defaults/Footer';
import { Header } from './components/defaults/Header';
import { Routes } from './Router';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    height: '100vh'
  }
});

const App: React.FC = () => {
  const classes = useStyles();

  return (
    <Router>
      <CssBaseline />
      <Grid container direction={'column'} className={classes.wrapper}>
        <Header />
        <Routes />
        <Footer />
      </Grid>
    </Router>
  );
};

export default App;
