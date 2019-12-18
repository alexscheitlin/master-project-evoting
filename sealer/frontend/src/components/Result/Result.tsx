import { Box, createStyles, List, ListItem, ListItemText, Theme, Typography, ListItemIcon } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import React, { useEffect, useState } from 'react'

import EqualizerIcon from '@material-ui/icons/Equalizer'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'

import { stepDescriptions } from '../../utils/descriptions'
import { StepTitle } from '../shared/StepTitle'
import { BallotService } from '../../services'
import { green, red } from '@material-ui/core/colors'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'

export const Result: React.FC = () => {
  const classes = useStyles()

  const [yesVotes, setYesVotes] = useState<number>(0)
  const [totalVotes, setTotalVotes] = useState<number>(0)
  const [votingQuestion, setVotingQuestion] = useState('')

  const getResult = async () => {
    const res = await BallotService.getBallotState()
    setYesVotes(res.yesVotes)
    setTotalVotes(res.totalVotes)
    setVotingQuestion(res.votingQuestion)
    console.log(res)
  }

  useEffect(() => {
    getResult()
  }, [])

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
          <ListItemText primary={`Total Number of Votes: ${totalVotes} `} />
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
          <ListItemText primary={`${totalVotes - yesVotes} NO votes`} />
        </ListItem>
        <ListItem>
          <ListItemText>
            <Typography variant="h5">
              The Result of the Vote is: <strong>{yesVotes > totalVotes - yesVotes ? 'YES' : 'NO'}</strong>
            </Typography>
          </ListItemText>
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
  })
)
