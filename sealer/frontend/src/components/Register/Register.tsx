import {
  Button,
  CircularProgress,
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Theme,
} from '@material-ui/core'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import React, { useEffect, useState } from 'react'

import { config } from '../../config'
import { useInterval } from '../../hooks/useInterval'
import { VotingState } from '../../models/states'
import { SealerBackend } from '../../services'
import { stepDescriptions } from '../../utils/descriptions'
import { delay } from '../../utils/helper'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'
import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'

interface Props {
  nextStep: () => void
}

export const Register: React.FC<Props> = ({ nextStep }: Props) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [wallet, setWallet] = useState('')

  const [requiredSealers, setRequiredSealers] = useState<number>()
  const [sealers, setSealers] = useState<string[]>([])
  const [listening, setListening] = useState<boolean>(false)

  useEffect(() => {
    const getRequiredValidators = async (): Promise<void> => {
      try {
        // FIXME: something does not work in the auth backend when connecting to the blockchain
        const data = await SealerBackend.getState()
        setRequiredSealers(data.requiredSealers)
      } catch (error) {
        console.log(error.message)
      }
    }
    getRequiredValidators()
  }, [])

  // Subscribe to newly registered sealers
  useEffect(() => {
    if (!listening) {
      const events = new EventSource(config.authBackend.devUrl + '/registered')
      events.onmessage = (event): void => {
        const parsedData = JSON.parse(event.data)
        setSealers(sealers => sealers.concat(parsedData))
      }

      setListening(true)
    }
  }, [listening, sealers])

  // Get Wallet information from sealer backend
  useEffect(() => {
    async function init(): Promise<void> {
      const address = await SealerBackend.getWalletAddress()
      setWallet(address)
    }
    init()
  }, [])

  const isStateChange = async (): Promise<void> => {
    const response = await SealerBackend.getState()
    if (response.state === VotingState.STARTUP) {
      nextStep()
    }
  }

  useInterval(isStateChange, 4000)

  // Tell the backend to register this sealer's wallet
  const register = async (): Promise<void> => {
    try {
      setLoading(true)
      setSuccess(false)
      await delay(500)
      await SealerBackend.registerWallet(wallet)
      setSuccess(true)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setSuccess(true)
      console.log(error.message)
    }
  }

  return (
    <StepContentWrapper>
      <StepTitle title="Address Registration" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.register}</ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SettingsEthernetIcon />
          </ListItemIcon>
          <ListItemText primary={`${sealers.length} / ${requiredSealers} Sealers registered`} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AccountBalanceWalletIcon color={'primary'} />
          </ListItemIcon>
          <ListItemText primary={wallet} secondary={'the public key of this sealer node'} />
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
          {!success ? (
            <Button variant="outlined" disabled={loading || success} onClick={register}>
              {!loading || !success ? <div> submit public key to authority </div> : null}
            </Button>
          ) : (
            <ListItemText primary="public key submitted" />
          )}
        </ListItem>
        {!success ? (
          <ListItem>
            <ListItemText
              primary={`Please click the button above to submit your public key to the voting authority for registration.`}
            />
          </ListItem>
        ) : null}
      </List>
      <List className={classes.next}>
        {success ? (
          <ListItem>
            <ListItemIcon>
              <CircularProgress size={24} />
            </ListItemIcon>
            <ListItemText
              primary={`Wait until all sealers are registered with the Authority and the blockchain configuration is ready.`}
            />
          </ListItem>
        ) : null}
      </List>
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
