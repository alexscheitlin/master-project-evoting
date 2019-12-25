import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { green, red } from '@material-ui/core/colors'
import EqualizerIcon from '@material-ui/icons/Equalizer'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import React, { useEffect, useState } from 'react'
import { stepDescriptions } from '../../../descriptions'
import { VotingState } from '../../../models/voting'
import { fetchState } from '../../../services/authBackend'
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar'
import { StepContentWrapper } from '../../defaults/StepContentWrapper'
import { StepTitle } from '../../defaults/StepTitle'

interface ResultProps {
  handleNext: () => void
}

interface ResultStateResponse {
  state: VotingState
  yesVotes: number
  noVotes: number
  votingQuestion: string
}

export const Result: React.FC<ResultProps> = ({ handleNext }: ResultProps) => {
  const [votingQuestion, setVotingQuestion] = useState('')

  const [yesVotes, setYesVotes] = useState<number>(0)
  const [noVotes, setNoVotes] = useState<number>(0)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const [whoWon, setWhoWon] = useState<string>()

  const getState = async (): Promise<void> => {
    try {
      const data: ResultStateResponse = (await fetchState()) as ResultStateResponse
      setYesVotes(data.yesVotes)
      setNoVotes(data.noVotes)
      setVotingQuestion(data.votingQuestion)
      if (yesVotes === noVotes) {
        setWhoWon('TIED')
      } else if (yesVotes > noVotes) {
        setWhoWon('YES')
      } else {
        setWhoWon('NO')
      }
    } catch (error) {
      setErrorMessage(error.msg)
      setHasError(true)
      console.error(error)
    }
  }

  // fetch state once at the beginning
  useEffect(() => {
    getState()
  })

  return (
    <StepContentWrapper>
      <StepTitle title="Result" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.result}</ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <QuestionAnswerIcon />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="h5">{votingQuestion}</Typography>
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EqualizerIcon />
          </ListItemIcon>
          <ListItemText primary={`Total Number of Votes: ${yesVotes + noVotes} `} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ThumbUpIcon style={{ color: green[500] }} />
          </ListItemIcon>
          <ListItemText primary={`${yesVotes} YES votes`} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ThumbDownIcon style={{ color: red[500] }} />
          </ListItemIcon>
          <ListItemText primary={`${noVotes} NO votes`} />
        </ListItem>
        <ListItem>
          <ListItemText>
            <Typography variant="h5">
              The Result of the Vote is: <strong>{whoWon}</strong>
            </Typography>
          </ListItemText>
        </ListItem>
      </List>
      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  )
}
