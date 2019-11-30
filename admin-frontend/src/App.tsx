import { CssBaseline, Grid, makeStyles } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Footer } from './components/defaults/Footer';
import { Header } from './components/defaults/Header';
import { StateProvider } from './gloablState';
import { Routes } from './Router';
import mainTheme from './Theme';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    height: '100vh'
  }
});

const App: React.FC = () => {
  const classes = useStyles();

  return (
    <StateProvider>
      <Router>
        <ThemeProvider theme={mainTheme}>
          <CssBaseline />
          <Grid container direction={'column'} className={classes.wrapper}>
            <Header />
            <Routes />
            <Footer />
          </Grid>
        </ThemeProvider>
      </Router>
    </StateProvider>
  );
};

export default App;
