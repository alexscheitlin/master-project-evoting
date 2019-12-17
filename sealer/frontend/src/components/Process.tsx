import { Box, Button, Divider, Grid, makeStyles, Step, StepLabel, Stepper, Theme, Typography } from '@material-ui/core'
import React, { useEffect, useState } from 'react'

import { VOTE_LABELS, VOTE_STATES } from '../models/states'
import { AuthBackend } from '../services'
import { Store } from '../store'
import { KeyGeneration } from './KeyGeneration'
import { Register } from './Register'
import { StartNode } from './StartNode'
import { TallyVotes } from './TallyVotes'
import { Voting } from './Voting/Voting'
import { Result } from './Result/Result'

export const Process: React.FC = () => {
  const classes = useStyles()

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const { activeStep, setActiveStep, nextStep, reset } = Store.useActiveStepStore()

  useEffect(() => {
    const getRequiredValidators = async () => {
      try {
        const data = await AuthBackend.getState()
        setActiveStep(VOTE_STATES.indexOf(data.state))
      } catch (error) {
        setErrorMessage(error.message)
        setHasError(true)
      }
    }

    getRequiredValidators()
  }, [])

  const getStep = (step: number): any => {
    switch (step) {
      case 0:
        return <Register nextStep={nextStep} />
      case 1:
        return <StartNode nextStep={nextStep} />
      case 2:
        return <KeyGeneration nextStep={nextStep} />
      case 3:
        return <Voting nextStep={nextStep} />
      case 4:
        return <TallyVotes nextStep={nextStep} />
      case 5:
        return <Result />
      default:
        reset()
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
