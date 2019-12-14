import { AppBar, Grid, makeStyles, Theme, Toolbar, Typography } from '@material-ui/core';
import React from 'react';

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
}));

export const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid item component="header">
      <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
            {`Sealer Nr: ${process.env.REACT_APP_SEALER_FRONTEND_PORT}`}
          </Typography>
        </Toolbar>
      </AppBar>
    </Grid>
  );
};
