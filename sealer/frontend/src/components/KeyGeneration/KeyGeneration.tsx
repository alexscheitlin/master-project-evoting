import { Button, createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import React, { useState } from 'react'
import { useInterval } from '../../hooks/useInterval'
import { VotingState } from '../../models/states'
import { BallotService, SealerBackend } from '../../services'
import { stepDescriptions } from '../../utils/descriptions'
import { ErrorSnackbar } from '../Helpers/ErrorSnackbar'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'
import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'

interface Props {
  nextStep: () => void
}

export const KeyGeneration: React.FC<Props> = ({ nextStep }) => {
  const classes = useStyles()

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const [keysSubmitted, setKeysSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const generateKeys = async (): Promise<void> => {
    try {
      setLoading(true)
      await SealerBackend.generateKeys()
      setLoading(false)
      setKeysSubmitted(true)
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.msg)
      console.log(error)
    }
  }
  const isStateChange = async (): Promise<void> => {
    try {
      const response = await BallotService.getBallotState()
      if (response.state === VotingState.VOTING) {
        nextStep()
      }
    } catch (error) {
      console.log(error)
    }
  }

  useInterval(isStateChange, keysSubmitted ? 4000 : 0)

  return (
    <StepContentWrapper>
      <StepTitle title="Key Generation" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.config}</ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <KeyboardArrowRightIcon />
          </ListItemIcon>
          <ListItemText primary={`The Smart Contract is deployed. Please submit your key share.`} />
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
          <Button variant="outlined" onClick={generateKeys} disabled={keysSubmitted}>
            Generate and submit keyshare
          </Button>
        </ListItem>
      </List>

      <List className={classes.next}>
        {keysSubmitted && (
          <ListItem>
            <ListItemIcon>
              <LoadSuccess loading={true} />
            </ListItemIcon>
            <ListItemText primary={`Waiting for the Ballot Smart Contract to open the vote.`} />
          </ListItem>
        )}
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      marginRight: theme.spacing(1),
      width: 160,
    },
    next: {
      position: 'absolute',
      bottom: 0,
    },
  })
)
