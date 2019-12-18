import { Button, createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import React, { useEffect, useState } from 'react'

import { useInterval } from '../../hooks/useInterval'
import { SealerBackend } from '../../services'
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

  const [ballotDeployed, setBallotDeployed] = useState(false)

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

  const checkIfBallotDeployed = async (): Promise<void> => {
    try {
      const isDeployed = await SealerBackend.isBallotDeployed()
      setBallotDeployed(isDeployed)
    } catch (error) {
      throw new Error('could not determine if ballot is deployed already')
    }
  }

  useEffect(() => {
    checkIfBallotDeployed()
  }, [])

  useInterval(checkIfBallotDeployed, !ballotDeployed ? 4000 : 0)

  return (
    <StepContentWrapper>
      <StepTitle title="Key Generation" />

      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.config}</ListItemText>
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
      </List>

      <List className={classes.nextButton}>
        <ListItem>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            disabled={!keysSubmitted}
            onClick={nextStep}
          >
            Next
          </Button>
        </ListItem>
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      minHeight: 700,
    },
    button: {
      marginRight: theme.spacing(1),
      width: 160,
    },
    nextButton: {
      position: 'absolute',
      bottom: 0,
    },
  })
)
