import { Button, createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core'
import React, { useState } from 'react'

import { useInterval } from '../../hooks/useInterval'
import { VotingState } from '../../models/states'
import { SealerBackend } from '../../services'
import { stepDescriptions } from '../../utils/descriptions'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'
import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'

interface Props {
  nextStep: () => void
}

export const Voting: React.FC<Props> = ({ nextStep }) => {
  const [readyForTally, setReadyForTally] = useState(false)
  const classes = useStyles()

  const getState = async (): Promise<void> => {
    const state = await SealerBackend.getState()
    setReadyForTally(state.state === VotingState.TALLY)
  }

  // only poll for peers if this node is not the bootnode
  useInterval(getState, !readyForTally ? 4000 : 0)

  return (
    <StepContentWrapper>
      <StepTitle title="Voting" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.voting}</ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <LoadSuccess loading={!readyForTally} success={readyForTally} />
          </ListItemIcon>

          <ListItemText
            primary={
              !readyForTally
                ? `Please wait until the Voting Authority closes the vote.`
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
