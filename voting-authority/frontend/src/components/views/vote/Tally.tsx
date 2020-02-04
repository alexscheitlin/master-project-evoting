import { Button, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import React, { useEffect, useState } from 'react'

import { stepDescriptions } from '../../../descriptions'
import { useVoteStateStore, VotingState } from '../../../models/voting'
import { fetchState } from '../../../services/authBackend'
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar'
import { StepContentWrapper } from '../../defaults/StepContentWrapper'
import { StepTitle } from '../../defaults/StepTitle'
import { LoadSuccess } from '../helper/LoadSuccess'
import { useInterval } from '../helper/UseInterval'

interface TallyProps {
  handleNext: () => void
}

interface TallyStateResponse {
  state: VotingState
  submittedDecryptedShares: number
  requiredDecryptedShares: number
}

export const Tally: React.FC<TallyProps> = ({ handleNext }: TallyProps) => {
  const classes = useStyles()
  const { nextState } = useVoteStateStore()

  const [submittedDecryptedShares, setSubmittedDecryptedShares] = useState<number>(0)
  const [requiredDecryptedShares, setRequiredDecryptedShares] = useState<number>(1)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const [readyForSummary, setReadyForSummary] = useState(false)
  const [inTransition, setInTransition] = useState(false)

  useEffect(() => {
    getState()
  }, [])

  useEffect(() => {
    if (submittedDecryptedShares === requiredDecryptedShares) {
      setReadyForSummary(true)
    }
  }, [submittedDecryptedShares, requiredDecryptedShares])

  const getState = async (): Promise<void> => {
    try {
      const data: TallyStateResponse = (await fetchState()) as TallyStateResponse
      setSubmittedDecryptedShares(data.submittedDecryptedShares)
      setRequiredDecryptedShares(data.requiredDecryptedShares)
    } catch (error) {
      setErrorMessage(error.msg)
      setHasError(true)
      console.error(error)
    }
  }

  useInterval(() => {
    getState()
  }, 4000)

  const nextStep = async (): Promise<void> => {
    try {
      setInTransition(true)
      await nextState()
      setInTransition(false)
      handleNext()
    } catch (error) {
      setErrorMessage(error.msg)
      setHasError(true)
    }
  }

  return (
    <StepContentWrapper>
      <StepTitle title="Tallying" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.tallying}</ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <VpnKeyIcon />
          </ListItemIcon>
          <ListItemText primary={`${submittedDecryptedShares}/${requiredDecryptedShares} decrypted shares submitted`} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <LoadSuccess loading={!readyForSummary} success={readyForSummary} />
          </ListItemIcon>
          <ListItemText
            primary={
              !readyForSummary
                ? `waiting until all decrypted shares have been submitted.`
                : `all decrypted shares have been submitted, summary can be generated`
            }
          />
        </ListItem>
      </List>

      <List className={classes.nextButton}>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            onClick={nextStep}
            className={classes.summaryButton}
            disabled={!readyForSummary}
          >
            {!inTransition ? `Generate Summary` : <LoadSuccess loading={true} white={true} />}
          </Button>
        </ListItem>
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  summaryButton: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 215,
    height: 36,
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
  },
}))
