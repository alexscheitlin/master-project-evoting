import {
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core'
import { green, red } from '@material-ui/core/colors'
import EqualizerIcon from '@material-ui/icons/Equalizer'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import React, { useEffect, useState } from 'react'
import Web3 from 'web3'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { StepTitle } from '../components/StepTitle'
import BallotContract from '../contract-abis/Ballot.json'
import { AccessProviderService, BallotService } from '../services'
import { useVoterStore } from '../store'
import getWeb3 from '../util/getWeb3'

interface Props {
  contract: string
}

const Result: React.FC<Props> = ({ contract }) => {
  const classes = useStyles()
  const [yesVotes, setYesVotes] = useState(0)
  const [noVotes, setNoVotes] = useState(0)
  const [totalVotes, setTotalVotes] = useState(0)
  const [votingQuestion, setVotingQuestion] = useState('')
  const [whoWon, setWhoWon] = useState<string>()
  const state = useVoterStore()

  const getState = async (): Promise<void> => {
    try {
      const connectionUrl = await AccessProviderService.getConnectionNodeUrl()
      const web3: Web3 = await getWeb3(connectionUrl)
      //@ts-ignore
      const ballot = new web3.eth.Contract(BallotContract.abi, contract)
      const nrOfYesVotes = await BallotService.getVoteResult(ballot)
      setYesVotes(nrOfYesVotes)
      const totalNrOfVotes = await BallotService.getNumberOfVotes(ballot)
      setTotalVotes(totalNrOfVotes)
      setNoVotes(totalNrOfVotes - nrOfYesVotes)
      const votingQuestion = await BallotService.getVotingQuestion(ballot)
      setVotingQuestion(votingQuestion)
    } catch (error) {
      console.error(error)
    }
  }

  // fetch state once at the beginning
  useEffect(() => {
    if (contract) {
      getState()
      if (yesVotes === noVotes) {
        setWhoWon('TIED')
      } else if (yesVotes > noVotes) {
        setWhoWon('YES')
      } else {
        setWhoWon('NO')
      }
    }
  }, [contract])

  return (
    <Container maxWidth="md">
      <Paper>
        <Header />
        <div className={classes.root}>
          <StepTitle title={'Result'} />
          <List>
            <ListItem>
              <ListItemText>The vote was tallied, the vote result is shown below.</ListItemText>
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
        </div>
        <Footer />
      </Paper>
    </Container>
  )
}

export default Result

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    minHeight: 700,
    padding: theme.spacing(3, 2),
  },
}))
