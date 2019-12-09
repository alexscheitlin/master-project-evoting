import { Snackbar, SnackbarContent, Theme, makeStyles, IconButton } from '@material-ui/core';
import { Error as ErrorIcon, Close as CloseIcon } from '@material-ui/icons';
import React, { useState } from 'react';

interface Props {
  open: boolean;
  message: string;
}

export const ErrorSnackbar: React.FC<Props> = ({ open, message }) => {
  const classes = useStyles();

  const [isOpen, setIsOpen] = useState<boolean>(true);

  const close = () => {
    setIsOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      open={isOpen && open}
      autoHideDuration={5000}
      onClick={close}
    >
      <SnackbarContent
        className={classes.error}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar" className={classes.message}>
            <ErrorIcon className={classes.icon} /> {` ${message}`}
          </span>
        }
        action={[
          <IconButton key="close" aria-label="close" color="inherit" onClick={close}>
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
        onClick={close}
      />
    </Snackbar>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  error: {
    backgroundColor: theme.palette.error.dark
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}));
