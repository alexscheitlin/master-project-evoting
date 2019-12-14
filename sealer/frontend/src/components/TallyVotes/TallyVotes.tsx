import { Button, createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { LoadSuccess } from '../shared/LoadSuccess';
import { StepTitle } from '../shared/StepTitle';

import { ErrorSnackbar } from '../Helpers/ErrorSnackbar';
import { SealerBackend } from '../../services';

interface Props {}

export const TallyVotes: React.FC<Props> = () => {
  const classes = useStyles();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const submitDecryptedShare = async () => {
    try {
      setLoading(true);
      const response = await SealerBackend.decryptShare();
      setLoading(false);
      setSuccess(true);

      console.log(response);
    } catch (error) {
      setHasError(true);
      setErrorMessage(error.msg);
    }
  };

  return (
    <div className={classes.root}>
      <StepTitle title="Tally Votes" />
      <div className={classes.wrapper}>
        <Button className={classes.button} variant="contained" onClick={submitDecryptedShare}>
          Submit Decrypted Share
        </Button>
      </div>
      <div className={classes.loader}>
        <LoadSuccess loading={loading} success={success} />
      </div>

      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </div>
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
    sealerInfo: {
      padding: theme.spacing(3, 0),
    },
    loader: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
  })
);
