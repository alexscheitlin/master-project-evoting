import { CssBaseline, Grid, makeStyles, Container, Paper } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { Footer } from './components/Helpers/Footer';
import { Header } from './components/Helpers/Header';
import { Process } from './components/Process';
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
      <Container maxWidth="lg">
        <Grid container justify="center" alignItems="center" className={classes.wrapper}>
          <Grid item xs={12}>
            <Paper elevation={2}>
              <Header />
              <Process />
              <Footer />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default App;
