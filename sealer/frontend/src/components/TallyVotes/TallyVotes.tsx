import { Box, Button, createStyles, List, ListItem, ListItemIcon, makeStyles, Theme } from '@material-ui/core'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import React, { useState } from 'react'

import { SealerBackend } from '../../services'
import { ErrorSnackbar } from '../Helpers/ErrorSnackbar'
import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'

interface Props {
  nextStep: () => void
}

export const TallyVotes: React.FC<Props> = ({ nextStep }) => {
  const classes = useStyles()

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const submitDecryptedShare = async () => {
    try {
      setLoading(true)
      const response = await SealerBackend.decryptShare()
      setLoading(false)
      setSuccess(true)
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.msg)
    }
  }

  return (
    <Box className={classes.root}>
      <StepTitle title="Tally Votes" />
      <List>
        <ListItem>
          {!loading && !success ? (
            <ListItemIcon>
              <VpnKeyIcon />
            </ListItemIcon>
          ) : null}
          {loading || success ? (
            <ListItemIcon>
              <LoadSuccess loading={loading} success={success} />
            </ListItemIcon>
          ) : null}
          <Button variant="outlined" onClick={submitDecryptedShare}>
            Submit Decrypted Share
          </Button>
        </ListItem>
      </List>
      <List className={classes.nextButton}>
        <ListItem>
          <Button variant="contained" color="primary" onClick={nextStep} disabled={!success}>
            Next Step
          </Button>
        </ListItem>
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </Box>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      minHeight: 700,
    },
    nextButton: {
      position: 'absolute',
      bottom: 0,
    },
  })
)
