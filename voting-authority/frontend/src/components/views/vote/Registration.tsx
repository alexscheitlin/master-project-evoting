import { Button, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme, Typography } from '@material-ui/core'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet'
import React, { useEffect, useState } from 'react'

import { stepDescriptions } from '../../../descriptions'
import { useVoteStateStore, VotingState } from '../../../models/voting'
import { fetchState } from '../../../services/authBackend'
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar'
import { StepContentWrapper } from '../../defaults/StepContentWrapper'
import { StepTitle } from '../../defaults/StepTitle'
import { LoadSuccess } from '../helper/LoadSuccess'
import { useInterval } from '../helper/UseInterval'

interface RegistrationProps {
  requiredSealers: number
  handleNext: () => void
}

interface RegistrationStateResponse {
  state: VotingState
  registeredSealers: number
  requiredSealers: number
  sealerAddresses: string[]
}

export const Registration: React.FC<RegistrationProps> = ({ requiredSealers, handleNext }: RegistrationProps) => {
  const classes = useStyles()

  const { nextState } = useVoteStateStore()

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const [sealers, setSealers] = useState<string[]>([])

  const [allSealersConnected, setAllSealersConnected] = useState(false)

  useEffect(() => {
    if (sealers.length === requiredSealers) {
      setAllSealersConnected(true)
    }
  }, [sealers, requiredSealers])

  useEffect(() => {
    getState()
  }, [])

  const getState = async (): Promise<void> => {
    try {
      const data: RegistrationStateResponse = (await fetchState()) as RegistrationStateResponse
      setSealers(data.sealerAddresses || [])
    } catch (error) {
      setErrorMessage(error.msg)
      setHasError(true)
      console.error(error)
    }
  }

  useInterval(() => getState(), 4000)

  const nextStep = async (): Promise<void> => {
    try {
      setLoading(true)

      await nextState()

      setLoading(false)
      setSuccess(true)

      handleNext()
    } catch (error) {
      setErrorMessage(error.message)
      setHasError(true)
    }
  }

  return (
    <StepContentWrapper>
      <StepTitle title="Address Registration" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.registration}</ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SettingsEthernetIcon />
          </ListItemIcon>
          <ListItemText primary={`currently ${sealers.length}/${requiredSealers} sealers are registered`} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <LoadSuccess loading={!allSealersConnected} success={allSealersConnected} />
          </ListItemIcon>
          <ListItemText
            primary={
              allSealersConnected
                ? `all sealers registered, you can proceed to the next step`
                : `please wait until all sealers have registered their address`
            }
          />
        </ListItem>
      </List>
      {sealers.length > 0 && (
        <Typography style={{ paddingLeft: '16px' }} variant="h6">
          Connected Sealers
        </Typography>
      )}

      <List>
        {sealers.map((sealer, index) => {
          return (
            <ListItem key={index}>
              <ListItemIcon>
                <AccountBalanceWalletIcon />
              </ListItemIcon>
              <ListItemText primary={`${sealer}`} />
            </ListItem>
          )
        })}
      </List>

      <List className={classes.nextButton}>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            onClick={nextStep}
            className={classes.button}
            disabled={!allSealersConnected}
          >
            Next Step
          </Button>
          <LoadSuccess success={success} loading={loading} />
        </ListItem>
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginRight: theme.spacing(1),
    width: 160,
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
  },
}))
