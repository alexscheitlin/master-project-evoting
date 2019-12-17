import { Container, CssBaseline, Grid, makeStyles } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import React from 'react'

import AppManager from './AppManager'
import AppWrapper from './components/Layout/AppWrapper/AppWrapper'
import mainTheme from './Theme'

const App: React.FC = () => {
  const classes = useStyles()

  return (
    <ThemeProvider theme={mainTheme}>
      <AppWrapper>
        <CssBaseline />
        <Container maxWidth="lg">
          <Grid container justify="center" alignItems="center" className={classes.wrapper}>
            <Grid item xs={12}>
              <AppManager />
            </Grid>
          </Grid>
        </Container>
      </AppWrapper>
    </ThemeProvider>
  )
}

export default App

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    height: '100vh',
  },
})
