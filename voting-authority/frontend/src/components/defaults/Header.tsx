import { AppBar, Grid, IconButton, makeStyles, MobileStepper, Theme, Toolbar, Typography } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import React from 'react';

import { useActiveStepStore } from '../../models/voting';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  toolbar: {
    flexWrap: 'wrap'
  },
  toolbarTitle: {
    flexGrow: 1
  },
  bar: {
    width: '100%',
    padding: 0
  }
}));

export const Header: React.FC = () => {
  const classes = useStyles();
  const { activeStep } = useActiveStepStore();

  return (
    <Grid item component="header">
      <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h5" color="inherit" noWrap className={classes.toolbarTitle}>
            Voting Authority
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => window.open('https://github.com/alexscheitlin/master-project-evoting', '_blank')}
          >
            <GitHubIcon />
          </IconButton>
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
  );
};
