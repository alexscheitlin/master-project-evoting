import { Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import React from 'react';

interface Props {
  contractAddress: string;
  walletAddress: string;
  balance: string;
}

const ChainInfo: React.FC<Props> = ({ contractAddress, walletAddress, balance }) => {
  const classes = useStyles();

  return (
    <Paper elevation={2} className={classes.root}>
      <Grid container direction="row">
        <Grid item xs={6}>
          <Grid container direction="row" alignItems="center">
            <Grid item xs={3}>
              <Typography variant="caption">Contract:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="caption">{contractAddress}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption"> Status:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="caption"> Open</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container direction="row" alignItems="center">
            <Grid item xs={3}>
              <Typography variant="caption"> Wallet:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="caption"> {walletAddress}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption"> Balance:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="caption"> {balance}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ChainInfo;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1),
    background: theme.palette.background.default,
  },
}));
