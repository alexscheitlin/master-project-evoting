import { AppBar, Button, Grid, IconButton, makeStyles, Theme, Toolbar, Typography } from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub'
import React from 'react'

import { useVoterStore } from '../store'

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarPlaceholder: {
    flexGrow: 1,
  },
  colorBar: {
    height: 4,
    backgroundColor: theme.palette.primary.main,
  },
}))

export const Header: React.FC = () => {
  const classes = useStyles()
  const state = useVoterStore()

  return (
    <Grid item component="header">
      <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.toolbarPlaceholder}></div>
          <IconButton
            color="inherit"
            onClick={(): Window | null => window.open('http://bcbev.ch/provotum-v2', '_blank')}
          >
            <GitHubIcon />
          </IconButton>
          {state.isAuthenticated() && (
            <Button variant="outlined" onClick={state.logout}>
              Logout
            </Button>
          )}
        </Toolbar>
        <div className={classes.colorBar}></div>
      </AppBar>
    </Grid>
  )
}
