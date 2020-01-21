import { Button, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme, Typography } from '@material-ui/core'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet'
import React, { useEffect, useState } from 'react'

import { DEV_URL } from '../../../constants'
import { stepDescriptions } from '../../../descriptions'
import { useVoteStateStore } from '../../../models/voting'
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar'
import { StepContentWrapper } from '../../defaults/StepContentWrapper'
import { StepTitle } from '../../defaults/StepTitle'
import { LoadSuccess } from '../helper/LoadSuccess'

interface RegistrationProps {
  requiredSealers: number
  handleNext: () => void
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
    const events = new EventSource(`${DEV_URL}/registered`)
    events.onmessage = (event): void => {
      const parsedData = JSON.parse(event.data)
      setSealers(sealers => sealers.concat(parsedData).filter((element, index, arr) => arr.indexOf(element) === index))
    }
    return () => {
      console.log('eventSource closed.')
      events.close()
    }
  }, [])

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
