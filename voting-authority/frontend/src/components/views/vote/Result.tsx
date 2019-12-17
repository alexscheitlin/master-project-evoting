import { Button, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme, Typography } from '@material-ui/core'
import { green, red } from '@material-ui/core/colors'
import EqualizerIcon from '@material-ui/icons/Equalizer'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import React, { useEffect, useState } from 'react'

import { useVoteStateStore, VotingState } from '../../../models/voting'
import { fetchState } from '../../../services/authBackend'
import { ErrorSnackbar } from '../../defaults/ErrorSnackbar'
import { StepContentWrapper } from '../../defaults/StepContentWrapper'
import { StepTitle } from '../../defaults/StepTitle'
import { LoadSuccess } from '../helper/LoadSuccess'

// simulates a delay like an asyc call would
const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t))

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
  const classes = useStyles()
  const { nextState } = useVoteStateStore()

  const [votingQuestion, setVotingQuestion] = useState('')

  const [yesVotes, setYesVotes] = useState<number>(0)
  const [noVotes, setNoVotes] = useState<number>(0)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)

  const [inTransition, setInTransition] = useState(false)

  const getState = async () => {
    try {
      const data: ResultStateResponse = (await fetchState()) as ResultStateResponse
      setYesVotes(data.yesVotes)
      setNoVotes(data.noVotes)
      setVotingQuestion(data.votingQuestion)
    } catch (error) {
      setErrorMessage(error.msg)
      setHasError(true)
      console.error(error)
    }
  }

  const getInfo = async () => {}

  // fetch state once at the beginning
  useEffect(() => {
    getState()
  })

  const reset = async () => {
    try {
      setInTransition(true)
      await delay(2000)
      await nextState()
      setInTransition(false)
      handleNext()
    } catch (error) {
      setErrorMessage(error.msg)
      setHasError(true)
    }
  }

  return (
    <StepContentWrapper>
      <StepTitle title="Voting Result" />
      <List>
        <ListItem>
          <ListItemIcon>
            <QuestionAnswerIcon />
          </ListItemIcon>
          <ListItemText primary={`"${votingQuestion}"`} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EqualizerIcon />
          </ListItemIcon>
          <ListItemText primary={`Toal Number of Votes: ${yesVotes + noVotes} `} />
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
              The Result of the Vote is: <strong>{yesVotes > noVotes ? 'YES' : 'NO'}</strong>
            </Typography>
          </ListItemText>
        </ListItem>
      </List>

      <List className={classes.nextButton}>
        <ListItem>
          <Button variant="contained" color="primary" onClick={reset} className={classes.button}>
            {!inTransition ? `New Vote` : <LoadSuccess loading={true} white={true} />}
          </Button>
        </ListItem>
      </List>

      {hasError && <ErrorSnackbar open={hasError} message={errorMessage} />}
    </StepContentWrapper>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    marginRight: theme.spacing(1),
    width: 160,
    height: 36,
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
  },
}))
