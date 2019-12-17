import {
  Box,
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
import { AuthBackend, SealerBackend } from '../../services'
import { delay } from '../../utils/helper'
import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'

interface Props {
  nextStep: () => void
}

export const Register: React.FC<Props> = ({ nextStep }: Props) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [wallet, setWallet] = useState('')

  const [state, setState] = useState()
  const [chainspecReady, setChainSpecReady] = useState(false)

  // TODO replace dynamically with a backend call
  const [requiredSealers, setRequiredSealers] = useState<number>()
  const [sealers, setSealers] = useState<string[]>([])
  const [listening, setListening] = useState<boolean>(false)

  const [readyForNextStep, setReadyForNextStep] = useState<boolean>(false)

  useEffect(() => {
    if (requiredSealers === sealers.length) {
      setReadyForNextStep(true)
    }
  }, [sealers, requiredSealers])

  useEffect(() => {
    const getRequiredValidators = async () => {
      try {
        // FIXME: something does not work in the auth backend when connecting to the blockchain
        const response = await AuthBackend.getState()
        setRequiredSealers(response.requiredSealers)
        setState(response.state)
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
      events.onmessage = event => {
        const parsedData = JSON.parse(event.data)
        setSealers(sealers => sealers.concat(parsedData))
      }

      setListening(true)
    }
  }, [listening, sealers])

  // Get Wallet information from sealer backend
  useEffect(() => {
    async function init() {
      const address = await SealerBackend.getWalletAddress()
      setWallet(address)
    }
    init()
    return () => {}
  }, [])

  const isChainSpecReady = async () => {
    const response = await AuthBackend.getState()
    if (response.state === VotingState.STARTUP) {
      setChainSpecReady(true)
    }
  }

  useInterval(isChainSpecReady, readyForNextStep && !chainspecReady ? 4000 : 0)

  // Tell the backend to register this sealer's wallet
  const register = async () => {
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
        {!readyForNextStep && success ? (
          <ListItem>
            <ListItemIcon>
              <CircularProgress size={24} />
            </ListItemIcon>
            <ListItemText primary={`Please wait for all other sealers to register.`} />
          </ListItem>
        ) : null}
        {readyForNextStep && !chainspecReady ? (
          <ListItem>
            <ListItemIcon>
              <CircularProgress size={24} />
            </ListItemIcon>
            <ListItemText primary={`Waiting for Authority to provide blockchain configuration.`} />
          </ListItem>
        ) : null}
        {!success ? (
          <ListItem>
            <ListItemText
              primary={`Please click the button above to submit your public key to the voting authority for registration.`}
            />
          </ListItem>
        ) : null}
      </List>
      <List className={classes.nextButton}>
        <ListItem>
          <Button
            className={classes.button}
            variant="contained"
            disabled={!readyForNextStep || !chainspecReady}
            onClick={nextStep}
            color="primary"
          >
            Next
          </Button>
        </ListItem>
      </List>
    </StepContentWrapper>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      minHeight: 700,
    },
    wrapper: {
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      marginRight: theme.spacing(1),
      width: 160,
    },
    statusButtonWrapper: {},

    loader: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
    nextButton: {
      position: 'absolute',
      bottom: 0,
    },
  })
)
