import { CssBaseline, Grid, makeStyles } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { Footer } from './components/Helpers/Footer';
import { Header } from './components/Helpers/Header';
import { Voting } from './components/Voting';
import mainTheme from './Theme';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    height: '100vh',
  },
});

const App: React.FC = () => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <Grid container direction={'column'} className={classes.wrapper}>
        <Header />
        <Voting />
        <Footer />
      </Grid>
    </ThemeProvider>
  );
};

export default App;
