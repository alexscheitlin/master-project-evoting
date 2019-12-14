import { Button, makeStyles, Theme } from '@material-ui/core';
import React, { useState } from 'react';
import { useVoteStateStore, VotingState } from '../../../models/voting';
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar';
import { useInterval } from '../helper/UseInterval';
import { fetchState } from '../../../services/authBackend';

interface TallyProps {
  handleNext: () => void;
}

interface TallyStateResponse {
  state: VotingState;
  submittedDecryptedShares: number;
  requiredDecryptedShares: number;
}

export const Tally: React.FC<TallyProps> = ({ handleNext }: TallyProps) => {
  const classes = useStyles();
  const { nextState } = useVoteStateStore();

  const [submittedDecryptedShares, setSubmittedDecryptedShares] = useState<number>(0);
  const [requiredDecryptedShares, setRequiredDecryptedShares] = useState<number>(1);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const getState = async () => {
    try {
      const data: TallyStateResponse = (await fetchState()) as TallyStateResponse;
      setSubmittedDecryptedShares(data.submittedDecryptedShares);
      setRequiredDecryptedShares(data.requiredDecryptedShares);
    } catch (error) {
      setErrorMessage(error.msg);
      setHasError(true);
      console.error(error);
    }
  };

  useInterval(() => {
    getState();
  }, 4000);

  const generateSummary = () => {};

  const nextStep = async () => {
    try {
      await nextState();
      handleNext();
    } catch (error) {
      setErrorMessage(error.msg);
      setHasError(true);
    }
  };

  return (
    <div className={classes.container}>
      <div>
        <h1>{`Tally Phase`}</h1>
        <h4>
          {`The vote has ended.` && submittedDecryptedShares !== requiredDecryptedShares
            ? `Please wait until all decrypted shares have been submitted.`
            : `All decrypted shares have been submitted. Summary can be generated!`}
        </h4>
        <h4>{`Nr. of decrypted shares: ${submittedDecryptedShares}/${requiredDecryptedShares}`}</h4>
      </div>
      <div className={classes.actionsContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={generateSummary}
          className={classes.button}
          disabled={submittedDecryptedShares !== requiredDecryptedShares}
        >
          Generate Summary
        </Button>
      </div>

      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  }
}));
