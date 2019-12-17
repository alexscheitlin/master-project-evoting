import React from 'react';

import AppManager from './AppManager';
import AppWrapper from './components/Layout/AppWrapper/AppWrapper';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { CssBaseline, makeStyles, Grid, Container } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import mainTheme from './Theme';

const App: React.FC = () => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={mainTheme}>
      <AppWrapper>
        <CssBaseline />
        <Container maxWidth="lg">
          <Grid container direction={'column'} className={classes.wrapper}>
            <Header />
            <AppManager />
            <Footer />
          </Grid>
        </Container>
      </AppWrapper>
    </ThemeProvider>
  );
};

export default App;

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    height: '100vh',
  },
});
