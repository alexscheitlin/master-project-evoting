import { AppBar, Button, Grid, makeStyles, Toolbar, Typography, Theme } from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

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
  link: {
    margin: theme.spacing(1, 1.5)
  }
}));

export const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid item component="header">
      <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
            Voting Authority
          </Typography>
          <nav>
            <Button>
              <RouterLink to="/">Vote</RouterLink>
            </Button>
            <Button>
              <RouterLink to="/summary">Summary</RouterLink>
            </Button>
          </nav>
          <Button color="primary" variant="outlined" className={classes.link}>
            Login
          </Button>
        </Toolbar>
      </AppBar>
    </Grid>
  );
};
