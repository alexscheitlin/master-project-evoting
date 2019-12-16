import { CssBaseline, Grid, makeStyles } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { Footer } from './components/defaults/Footer';
import { Header } from './components/defaults/Header';
import { Process } from './components/views/Process';
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
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <Grid container direction={'column'} className={classes.wrapper}>
        <Header />
        <Process />
        <Footer />
      </Grid>
    </ThemeProvider>
  );
};

export default App;
