import { Grid, makeStyles, Theme } from '@material-ui/core'
import React, { useEffect, useState } from 'react'

import { useInterval } from './hooks/useInterval'
import { VotingState } from './models/voting'
import LoadingPage from './pages/LoadingPage'
import LoginPage from './pages/LoginPage'
import NotOpen from './pages/NotOpen'
import Result from './pages/Result'
import Tally from './pages/Tally'
import VotingPage from './pages/VotingPage'
import { AccessProviderService } from './services'
import { useVoterStore } from './store'

const AppManager: React.FC = () => {
  const classes = useStyles()
  const state = useVoterStore()

  const [votingState, setVotingState] = useState<VotingState>()
  const [contract, setContract] = useState<string>('')

  const [error, setError] = useState(false)

  const setupDone = (): boolean => {
    return state.isAuthenticated() && state.isTokenSet() && state.isWalletSet() && state.isBallotContractAddressSet()
  }

  // check what values are already in local storage
  useEffect(() => {
    if (state.isAuthenticated()) {
      state.setAuthenicated(true)
    }

    if (state.isTokenSet()) {
      state.setToken(state.getToken())
    }

    if (state.isWalletSet()) {
      state.setWallet(state.getWallet())
    }

    if (state.isBallotContractAddressSet()) {
      state.setBallotContractAddress(state.getBallotContractAddress())
    }
  }, [])

  const fetchState = async () => {
    try {
      const res = await AccessProviderService.getState()
      setVotingState(res.state)
      setContract(res.address)
    } catch (error) {
      setError(true)
    }
  }

  useEffect(() => {
    fetchState()
    return () => {}
  }, [])

  useInterval(fetchState, votingState === VotingState.RESULT ? 0 : 4000)

  const getPage = (): React.ReactNode => {
    switch (votingState) {
      case VotingState.REGISTRATION:
      case VotingState.PAIRING:
      case VotingState.KEY_GENERATION:
        return <NotOpen />
      case VotingState.VOTING:
        if (!state.authenticated) {
          return <LoginPage />
        } else if (!setupDone()) {
          return <LoadingPage />
        } else {
          return <VotingPage />
        }
      case VotingState.TALLYING:
        return <Tally />
      case VotingState.RESULT:
        return <Result contract={contract} />
      default:
        return <NotOpen />
    }
  }

  // LoginPage displays the login form per default
  // once the user submits her details, the LoginPage shows the LoadingPage
  // once everything is laoded correctly, the VotingPage is displayed
  return (
    <Grid container direction={'row'} justify="center" alignItems="center" className={classes.root}>
      <Grid item xs={12}>
        {getPage()}
      </Grid>
    </Grid>
  )
}

export default AppManager

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    minHeight: 700,
  },
}))
