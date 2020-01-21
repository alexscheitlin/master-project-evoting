import { Divider, Grid, makeStyles, Step, StepLabel, Stepper, Theme, Typography } from '@material-ui/core'
import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'

import { DEV_URL } from '../../constants'
import { useActiveStepStore, useVoteStateStore, VOTE_LABELS, VOTE_STATES, VotingState } from '../../models/voting'
import { ErrorSnackbar } from '../defaults/ErrorSnackbar'
import { KeyGeneration, Pairing, Registration, Tally, Vote } from './vote'
import { Result } from './vote/Result'

interface StateResponse {
  state: VotingState
  registeredSealers: number
  requiredSealers: number
}

export const Process: React.FC = () => {
  const classes = useStyles()

  const [requiredSealers, setRequiredSealers] = useState<number>(3)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const { setState } = useVoteStateStore()
  const { activeStep, setActiveStep, nextStep } = useActiveStepStore()

  useEffect(() => {
    const getRequiredValidators = async (): Promise<void> => {
      try {
        const response: AxiosResponse<StateResponse> = await axios.get(`${DEV_URL}/state`)

        if (response.status === 200) {
          setRequiredSealers(response.data.requiredSealers)
          setState(response.data.state)
          setActiveStep(VOTE_STATES.indexOf(response.data.state))
        } else {
          throw new Error(`GET /state -> status code not 200. Status code is: ${response.status}`)
        }
      } catch (error) {
        setErrorMessage(error.message)
        setHasError(true)
      }
    }

    getRequiredValidators()
    // TODO: figure out why this only works with an empty dependency array added but not when it is removed
    // => should be the same since we only want to run this hook once at the beginning of the component rendering
  }, [])

  const getStep = (step: number): React.ReactNode => {
    switch (step) {
      case 0:
        return <Registration handleNext={nextStep} requiredSealers={requiredSealers} />
      case 1:
        return <Pairing handleNext={nextStep} requiredSealers={requiredSealers} />
      case 2:
        return <KeyGeneration handleNext={nextStep} />
      case 3:
        return <Vote handleNext={nextStep} />
      case 4:
        return <Tally handleNext={nextStep} />
      case 5:
        return <Result handleNext={nextStep} />
      default:
        return (
          <div>
            <h1>Error: Step doesn`&apos;`t exist!</h1>
            <ErrorSnackbar open={hasError} message={errorMessage} />
          </div>
        )
    }
  }

  return (
    <Grid container direction={'row'} justify="center" className={classes.root}>
      <Grid item xs={3}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {VOTE_LABELS.map(label => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="h5">{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Grid item>
        <Divider orientation="vertical" />
      </Grid>
      <Grid item xs={8}>
        <div className={classes.contentWrapper}>{getStep(activeStep)}</div>
      </Grid>
      <Grid item xs></Grid>
    </Grid>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    minHeight: 700,
  },
  contentWrapper: {
    padding: theme.spacing(3, 2),
  },
}))
