import {
  Box,
  Button,
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Theme,
} from '@material-ui/core'
import React, { useState } from 'react'

import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'
import { useInterval } from '../../hooks/useInterval'
import { AuthBackend } from '../../services'
import { VotingState } from '../../models/states'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'

interface Props {
  nextStep: () => void
}

export const Voting: React.FC<Props> = ({ nextStep }) => {
  const [readyForTally, setReadyForTally] = useState(false)
  const classes = useStyles()

  const getState = async () => {
    const state = await AuthBackend.getState()
    setReadyForTally(state.state === VotingState.TALLY)
  }

  // only poll for peers if this node is not the bootnode
  useInterval(getState, !readyForTally ? 4000 : 0)

  return (
    <StepContentWrapper>
      <StepTitle title="Voting" />
      <List>
        <ListItem>
          <ListItemIcon>
            <LoadSuccess loading={!readyForTally} success={readyForTally} />
          </ListItemIcon>

          <ListItemText
            primary={
              !readyForTally
                ? `The vote is currently open and still ongoing. Please wait until the Voting Authority closes the vote.`
                : `The Voting Authority has closed the vote. Please proceed to the next step.`
            }
          />
        </ListItem>

        <ListItem>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            disabled={!readyForTally}
            onClick={nextStep}
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
