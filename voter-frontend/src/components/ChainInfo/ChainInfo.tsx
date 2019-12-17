import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import React from 'react';

import mainTheme from '../../Theme';

interface Props {
  contractAddress: string;
  walletAddress: string;
  balance: string;
}

const ChainInfo: React.FC<Props> = ({ contractAddress, walletAddress, balance }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container direction="row">
        <Grid item xs={6}>
          <List>
            <ListItem>
              <ListItemIcon>
                <AccountBalanceWalletIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={`${walletAddress}`} secondary={`wallet address`} />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={6}>
          <List>
            <ListItem>
              <ListItemIcon>
                <FontAwesomeIcon color={mainTheme.palette.primary.main} size="2x" icon={'file-contract'} />
              </ListItemIcon>
              <ListItemText primary={`${walletAddress}`} secondary={`contract address`} />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </div>
  );
};

export default ChainInfo;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'absolute',
    bottom: 0,
    padding: theme.spacing(1),
  },
}));
