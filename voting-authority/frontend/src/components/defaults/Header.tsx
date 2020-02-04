import { AppBar, Grid, IconButton, makeStyles, MobileStepper, Theme, Toolbar, Typography } from '@material-ui/core'
import { red, green } from '@material-ui/core/colors'
import GitHubIcon from '@material-ui/icons/GitHub'
import React from 'react'
import { useActiveStepStore } from '../../models/voting'

export const Header: React.FC = () => {
  const classes = useStyles()
  const { activeStep } = useActiveStepStore()

  const stepName: string = activeStep >= 2 ? `ON CHAIN` : `OFF CHAIN`
  const stepColor = activeStep >= 2 ? classes.greenButton : classes.redButton

  return (
    <Grid item component="header">
      <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h5" color="inherit" noWrap className={classes.toolbarTitle}>
            Voting Authority
          </Typography>
          <div className={classes.buttonWrapper}>
            <Typography variant="h6" className={stepColor} noWrap>
              {stepName}
            </Typography>
            <IconButton
              color="inherit"
              onClick={(): Window | null => window.open('http://bcbev.ch/provotum-v2', '_blank')}
            >
              <GitHubIcon />
            </IconButton>
          </div>
        </Toolbar>
        <MobileStepper
          classes={{ progress: classes.bar }}
          className={classes.bar}
          variant="progress"
          steps={6}
          position="static"
          activeStep={activeStep}
          nextButton={<span></span>}
          backButton={<span></span>}
        />
      </AppBar>
    </Grid>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  bar: {
    width: '100%',
    padding: 0,
  },
  buttonWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  redButton: {
    color: red[400],
  },
  greenButton: {
    color: green[400],
  },
}))
