import { createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import ReceiptIcon from '@material-ui/icons/Receipt'
import React, { useState } from 'react'
import { useInterval } from '../../hooks/useInterval'
import { VotingState } from '../../models/states'
import { BallotService } from '../../services'
import { stepDescriptions } from '../../utils/descriptions'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'
import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'

interface Props {
  nextStep: () => void
}

export const Voting: React.FC<Props> = ({ nextStep }) => {
  const classes = useStyles()

  const [votesSubmitted, setVotesSubmitted] = useState<number>(0)
  const [votingQuestion, setVotingQuesiton] = useState<string>('')

  const isStateChange = async (): Promise<void> => {
    try {
      const response = await BallotService.getBallotState()
      if (response.state === VotingState.VOTING) {
        console.log('ballot state', response)
        setVotesSubmitted(response.nrOfVotes)
        setVotingQuesiton(response.votingQuestion)
      } else if (response.state === VotingState.TALLYING) {
        nextStep()
      }
    } catch (error) {
      console.log(error)
    }
  }

  useInterval(isStateChange, 4000)

  return (
    <StepContentWrapper>
      <StepTitle title="Voting" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.voting}</ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <QuestionAnswerIcon />
          </ListItemIcon>
          <ListItemText primary={`${votingQuestion}`} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText>{votesSubmitted} - votes submitted</ListItemText>
        </ListItem>
      </List>
      <List className={classes.next}>
        <ListItem>
          <ListItemIcon>
            <LoadSuccess loading={true} />
          </ListItemIcon>
          <ListItemText primary={`Please wait until the Voting Authority closes the vote.`} />
        </ListItem>
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
