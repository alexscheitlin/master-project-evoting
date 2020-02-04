import { Button, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'

import { DEV_URL } from '../../../constants'
import { stepDescriptions } from '../../../descriptions'
import { useVoteStateStore, VotingState } from '../../../models/voting'
import { fetchState } from '../../../services/authBackend'
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar'
import { StepContentWrapper } from '../../defaults/StepContentWrapper'
import { StepTitle } from '../../defaults/StepTitle'
import { LoadSuccess } from '../helper/LoadSuccess'
import { useInterval } from '../helper/UseInterval'

// simulates a delay like an asyc call would
const delay = (t: number): Promise<void> => new Promise(resolve => setTimeout(resolve, t))

interface KeyGenerationProps {
  handleNext: () => void
}

interface KeyGenerationStateReponse {
  state: VotingState
  submittedKeyShares: number
  requiredKeyShares: number
  publicKey: number
}

interface PublicKeyPostResponse {
  msg: string
  publicKey: number
}

export const KeyGeneration: React.FC<KeyGenerationProps> = ({ handleNext }: KeyGenerationProps) => {
  const classes = useStyles()
  const REFRESH_INTERVAL_MS = 4000

  const { nextState } = useVoteStateStore()

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const [requiredKeyShares, setRequiredKeyShares] = useState<number>(1000)
  const [submittedKeyShares, setSubmittedKeyShares] = useState<number>(0)

  const [allKeySharesSubmitted, setAllKeySharesSubmitted] = useState(false)

  const [publicKey, setPublicKey] = useState<number>(0)
  const [publicKeyGenerated, setPublicKeyGenerated] = useState<boolean>(false)

  const [inKeyGeneration, setInKeyGeneration] = useState(false)
  const [inOpeningVote, setInOpeningVote] = useState(false)

  useEffect(() => {
    checkNumberOfSubmittedPublicKeyShares()
  }, [])

  useEffect(() => {
    if (requiredKeyShares === submittedKeyShares) {
      setAllKeySharesSubmitted(true)
    }
  }, [requiredKeyShares, submittedKeyShares])

  const generatePublicKey = async (): Promise<void> => {
    try {
      setInKeyGeneration(true)
      const response: AxiosResponse<PublicKeyPostResponse> = await axios.post(`${DEV_URL}/publickey`, {})

      if (response.status === 201) {
        setPublicKey(response.data.publicKey)
        setPublicKeyGenerated(true)
        await delay(500)
        setInKeyGeneration(false)
      } else {
        throw new Error(`GET /state. Status Code: ${response.status} -> not what was expected.`)
      }
    } catch (error) {
      setInKeyGeneration(false)
      console.error(error)
      setErrorMessage(error.msg)
      setHasError(true)
    }
  }

  const checkNumberOfSubmittedPublicKeyShares = async (): Promise<void> => {
    try {
      const data: KeyGenerationStateReponse = (await fetchState()) as KeyGenerationStateReponse
      setRequiredKeyShares(data.requiredKeyShares)
      setSubmittedKeyShares(data.submittedKeyShares)

      if (data.publicKey > 0) {
        setPublicKey(data.publicKey)
        setPublicKeyGenerated(true)
      }
    } catch (error) {
      setErrorMessage(error.msg)
      setHasError(true)
    }
  }

  const nextStep = async (): Promise<void> => {
    setInOpeningVote(true)
    await delay(2000)
    try {
      await nextState()
      setInOpeningVote(false)
      handleNext()
    } catch (error) {
      setInOpeningVote(false)
      setErrorMessage(error.msg)
      setHasError(true)
    }
  }

  useInterval(
    () => {
      checkNumberOfSubmittedPublicKeyShares()
    },
    !allKeySharesSubmitted ? REFRESH_INTERVAL_MS : 0
  )

  return (
    <StepContentWrapper>
      <StepTitle title="Key Generation" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.keyGeneration}</ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <VpnKeyIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              !publicKeyGenerated
                ? `${submittedKeyShares}/${requiredKeyShares} public key shares have been submitted`
                : `the public key of the system is: ${publicKey}`
            }
          />
        </ListItem>
        <ListItem>
          {!allKeySharesSubmitted && (
            <ListItemIcon>
              <LoadSuccess loading={!allKeySharesSubmitted} />
            </ListItemIcon>
          )}
          {allKeySharesSubmitted && !publicKeyGenerated && !inKeyGeneration && (
            <ListItemIcon>
              <PriorityHighIcon color="action" />
            </ListItemIcon>
          )}

          {publicKeyGenerated || inKeyGeneration ? (
            <ListItemIcon>
              <LoadSuccess loading={inKeyGeneration} success={publicKeyGenerated && !inKeyGeneration} />
            </ListItemIcon>
          ) : null}

          <ListItemText
            primary={
              !allKeySharesSubmitted
                ? `waiting for all key shares to be submitted`
                : !publicKeyGenerated
                ? `the public key can be generated`
                : `public key set, vote can be opened`
            }
          />
        </ListItem>

        <ListItem>
          <Button
            variant="outlined"
            onClick={generatePublicKey}
            className={classes.button}
            disabled={!allKeySharesSubmitted || publicKeyGenerated}
          >
            Generate Public Key
          </Button>
        </ListItem>
      </List>

      <List className={classes.nextButton}>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            onClick={nextStep}
            disabled={!publicKeyGenerated}
            className={classes.voteButton}
          >
            {!inOpeningVote ? `Open Vote` : <LoadSuccess loading={true} white={true} />}
          </Button>
        </ListItem>
      </List>

      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  voteButton: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 160,
    height: 36,
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
  },
}))
