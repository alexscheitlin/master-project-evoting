import { Box, Button, createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import React, { useEffect, useState } from 'react';

import { config } from '../../config';
import { AuthBackend, SealerBackend } from '../../services';
import { delay } from '../../utils/helper';
import { LoadSuccess } from '../shared/LoadSuccess';
import { StepTitle } from '../shared/StepTitle';

interface Props {
  nextStep: () => void;
}

export const Register: React.FC<Props> = ({ nextStep }: Props) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [wallet, setWallet] = useState('');

  const [state, setState] = useState();

  // TODO replace dynamically with a backend call
  const [requiredSealers, setRequiredSealers] = useState<number>(3);
  const [sealers, setSealers] = useState<string[]>([]);
  const [listening, setListening] = useState<boolean>(false);

  const [readyForNextStep, setReadyForNextStep] = useState<boolean>(false);

  // set a flag in the parent component that transition into next step is possible
  useEffect(() => {
    setReadyForNextStep(requiredSealers === sealers.length);
  }, [sealers, requiredSealers]);

  useEffect(() => {
    const getRequiredValidators = async () => {
      try {
        // FIXME: something does not work in the auth backend when connecting to the blockchain
        const response = await AuthBackend.getState();
        setRequiredSealers(response.requiredSealers);
        setState(response.state);
      } catch (error) {
        console.log(error.message);
      }
    };
    getRequiredValidators();
  }, []);

  // Subscribe to newly registered sealers
  useEffect(() => {
    if (!listening) {
      const events = new EventSource(config.authBackend.devUrl + '/registered');
      events.onmessage = event => {
        const parsedData = JSON.parse(event.data);
        setSealers(sealers => sealers.concat(parsedData));
      };

      setListening(true);
    }
  }, [listening, sealers]);

  // Get Wallet information from sealer backend
  useEffect(() => {
    async function init() {
      const address = await SealerBackend.getWalletAddress();
      setWallet(address);
    }
    init();
    return () => {};
  }, []);

  // Tell the backend to register this sealer's wallet
  const register = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      await delay(500);
      await SealerBackend.registerWallet(wallet);
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setSuccess(true);
      console.log(error.message);
    }
  };

  return (
    <Box className={classes.root}>
      <StepTitle title="Address Registration" />
      <List>
        <ListItem>
          <ListItemIcon>
            <AccountBalanceWalletIcon color={'primary'} />
          </ListItemIcon>
          <ListItemText primary={wallet} secondary={'the public key of this sealer node'} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SettingsEthernetIcon />
          </ListItemIcon>
          <ListItemText primary={`${sealers.length} / ${requiredSealers} Sealers registered`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Click the button below to submit your wallet to the voting authority for registration.`} />
        </ListItem>
        <ListItem>
          <Button className={classes.button} variant="contained" disabled={loading} onClick={register}>
            Submit
          </Button>
          <Button className={classes.button} variant="contained" disabled={!readyForNextStep} onClick={nextStep} color="primary">
            Next
          </Button>
        </ListItem>
      </List>
      <div className={classes.loader}>
        <LoadSuccess loading={loading} success={success} />
      </div>
    </Box>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    wrapper: {
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      marginRight: theme.spacing(1),
    },
    statusButtonWrapper: {},

    loader: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
  })
);
