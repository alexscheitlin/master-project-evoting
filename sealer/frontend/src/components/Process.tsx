import { Divider, Grid, makeStyles, Step, StepLabel, Stepper, Theme, Typography } from '@material-ui/core'
import React, { useEffect } from 'react'

import { VOTE_LABELS, VOTE_STATES } from '../models/states'
import { SealerBackend } from '../services'
import { Store } from '../store'
import { KeyGeneration } from './KeyGeneration'
import { Register } from './Register'
import { Result } from './Result/Result'
import { StartNode } from './StartNode'
import { TallyVotes } from './TallyVotes'
import { Voting } from './Voting/Voting'

export const Process: React.FC = () => {
  const classes = useStyles()

  const { activeStep, setActiveStep, nextStep, reset } = Store.useActiveStepStore()

  useEffect(() => {
    const getRequiredValidators = async (): Promise<void> => {
      try {
        const data = await SealerBackend.getState()
        setActiveStep(VOTE_STATES.indexOf(data.state))
      } catch (error) {
        // TODO: wire up project with a global error snack bar
        console.log(error)
      }
    }

    getRequiredValidators()
  }, [])

  const getStep = (step: number): React.ReactNode => {
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
                <Typography variant="h6">{label}</Typography>
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
