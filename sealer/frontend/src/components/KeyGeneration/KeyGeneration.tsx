import { Box, Button, createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import React, { useEffect, useState } from 'react';

import { useInterval } from '../../hooks/useInterval';
import { SealerBackend } from '../../services';
import { ErrorSnackbar } from '../Helpers/ErrorSnackbar';
import { LoadSuccess } from '../shared/LoadSuccess';
import { StepTitle } from '../shared/StepTitle';

interface Props {
  nextStep: () => void;
}

export const KeyGeneration: React.FC<Props> = ({ nextStep }) => {
  const classes = useStyles();

  const [ballotDeployed, setBallotDeployed] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const [keysSubmitted, setKeysSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateKeys = async () => {
    try {
      setLoading(true);
      await SealerBackend.generateKeys();
      setLoading(false);
      setKeysSubmitted(true);
    } catch (error) {
      setHasError(true);
      setErrorMessage(error.msg);
      console.log(error);
    }
  };

  const checkIfBallotDeployed = async () => {
    try {
      const isDeployed = await SealerBackend.isBallotDeployed();
      setBallotDeployed(isDeployed);
    } catch (error) {
      throw new Error('could not determine if ballot is deployed already');
    }
  };

  useEffect(() => {
    checkIfBallotDeployed();
  }, []);

  useInterval(checkIfBallotDeployed, !ballotDeployed ? 4000 : 0);

  return (
    <Box className={classes.root}>
      <StepTitle title="Key generation" />
      <List>
        <ListItem>
          <ListItemText
            primary={`Take part in the distributed key generation for the e-Voting system. By clicking the button below a key pair will be generated. The public part will be submitted to the Ballot Smart Contract.`}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <LoadSuccess loading={!ballotDeployed} success={ballotDeployed} />
          </ListItemIcon>
          <ListItemText
            primary={
              !ballotDeployed
                ? `Waiting for the Voting Authority to deploy the Smart Contract`
                : `The Smart Contract was deployed. You can submit your key share now.`
            }
          />
        </ListItem>
        <ListItem>
          {!loading && !keysSubmitted ? (
            <ListItemIcon>
              <VpnKeyIcon />
            </ListItemIcon>
          ) : null}
          {loading || keysSubmitted ? (
            <ListItemIcon>
              <LoadSuccess loading={loading} success={keysSubmitted} />
            </ListItemIcon>
          ) : null}

          <Button variant="outlined" onClick={generateKeys} disabled={keysSubmitted || !ballotDeployed}>
            Generate and submit keyshare
          </Button>
        </ListItem>

        <ListItem>
          <Button className={classes.button} variant="contained" color="primary" disabled={!keysSubmitted} onClick={nextStep}>
            Next
          </Button>
        </ListItem>
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </Box>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    button: {
      marginRight: theme.spacing(1),
      width: 160,
    },
  })
);
