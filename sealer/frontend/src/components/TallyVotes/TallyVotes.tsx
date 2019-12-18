import { Button, createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import React, { useState } from 'react'

import { SealerBackend, BallotService } from '../../services'
import { stepDescriptions } from '../../utils/descriptions'
import { ErrorSnackbar } from '../Helpers/ErrorSnackbar'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'
import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'
import { VotingState } from '../../models/states'
import { useInterval } from '../../hooks/useInterval'

interface Props {
  nextStep: () => void
}

export const TallyVotes: React.FC<Props> = ({ nextStep }) => {
  const classes = useStyles()

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const submitDecryptedShare = async (): Promise<void> => {
    try {
      setLoading(true)
      await SealerBackend.decryptShare()
      setLoading(false)
      setSuccess(true)
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.msg)
    }
  }

  const isStateChange = async (): Promise<void> => {
    try {
      const response = await BallotService.getBallotState()
      if (response.state === VotingState.RESULT) {
        nextStep()
      }
    } catch (error) {
      console.log(error)
    }
  }

  useInterval(isStateChange, 4000)

  return (
    <StepContentWrapper>
      <StepTitle title="Tally Votes" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.tally}</ListItemText>
        </ListItem>
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
      <List className={classes.next}>
        {success && (
          <ListItem>
            <ListItemIcon>
              <LoadSuccess loading={true} />
            </ListItemIcon>
            <ListItemText primary={`Waiting for the results of the vote`} />
          </ListItem>
        )}
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    next: {
      position: 'absolute',
      bottom: 0,
    },
  })
)
