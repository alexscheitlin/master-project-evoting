import { SnackbarContent } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CloseIcon from '@material-ui/icons/Close'
import ErrorIcon from '@material-ui/icons/Error'
import clsx from 'clsx'
import React from 'react'

import { useErrorStore } from '../../store'

export enum Snack {
  ERROR = 'error',
  SUCCESS = 'success',
}

const variantIcon = {
  [Snack.SUCCESS]: CheckCircleIcon,
  [Snack.ERROR]: ErrorIcon,
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    close: {
      padding: theme.spacing(0.5),
    },
    icon: {
      fontSize: 20,
    },
    iconVariant: {
      opacity: 0.9,
      marginRight: theme.spacing(1),
    },
    message: {
      display: 'flex',
      alignItems: 'center',
    },
    success: {
      backgroundColor: theme.palette.primary.light,
    },
    error: {
      backgroundColor: theme.palette.error.light,
    },
    info: {
      backgroundColor: theme.palette.primary.main,
    },
  })
)

export const SimpleSnackbar: React.FC = () => {
  const classes = useStyles()
  const show = useErrorStore(state => state.show)
  const close = useErrorStore(state => state.close)
  const message = useErrorStore(state => state.message)
  const variant: Snack = useErrorStore(state => state.variant)

  const Icon = variantIcon[variant]

  const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    close(variant)
  }

  return (
    <Snackbar
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={show}
      onClose={handleClose}
      autoHideDuration={6000}
    >
      <SnackbarContent
        className={clsx(classes[variant])}
        message={
          <span id="message-id" className={classes.message}>
            <Icon className={clsx(classes.icon, classes.iconVariant)} />
            {message}
          </span>
        }
        action={[
          <IconButton key="close" aria-label="close" color="inherit" className={classes.close} onClick={handleClose}>
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </Snackbar>
  )
}
