import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import copy from 'copy-to-clipboard'
import React, { useEffect, useRef, useState } from 'react'

import { SubmissionState, VotingOption } from '../../models/voting'
import { BallotService } from '../../services'
import { useVoterStore } from '../../store'
import mainTheme from '../../Theme'
import { delay } from '../../util/helper'

interface Props {
  contract: any
}

const VotingPanel: React.FC<Props> = ({ contract }) => {
  const [selectedVote, setSelectedVote] = useState<VotingOption>(VotingOption.UNSPEC)
  const [submissionState, setSubmissionState] = useState(SubmissionState.NOT_CONFIRMED)
  const [message, setMessage] = useState('Please submit a vote below')
  const [loading, setLoading] = useState(false)
  const voterState = useVoterStore()
  const [voteTx, setVoteTx] = useState(voterState.voteTx)
  const [copied, setCopied] = useState(false)

  const handleToggle = (event: React.MouseEvent<HTMLElement>, newValue: string): void => {
    if (newValue === VotingOption.YES) {
      setSelectedVote(VotingOption.YES)
    } else if (newValue === VotingOption.NO) {
      setSelectedVote(VotingOption.NO)
    }
  }

  const submitVote = async (): Promise<any> => {
    setMessage('Submitting Vote')
    setSubmissionState(SubmissionState.IN_SUBMISSION)
    setLoading(true)
    await delay(1000)
    switch (selectedVote) {
      case VotingOption.YES:
        try {
          const res: any = await BallotService.castYesVote(contract, voterState.wallet)
          const voteTx = {
            blockHash: res.blockHash,
            blockNumber: res.blockNumber,
            from: res.from,
            to: res.to,
            transactionHash: res.transactionHash,
            accepted: res.accepted,
          }
          voterState.setVoteTx(voteTx)
          setVoteTx(voteTx)
          setMessage('Your Vote was submitted successfully.')
          setSubmissionState(SubmissionState.CONFIRMED)
        } catch (error) {
          setMessage(`Unable to submit your vote.`)
          setSubmissionState(SubmissionState.NOT_CONFIRMED)
        }
        break
      case VotingOption.NO:
        try {
          const res: any = await BallotService.castNoVote(contract, voterState.wallet)
          const voteTx = {
            blockHash: res.blockHash,
            blockNumber: res.blockNumber,
            from: res.from,
            to: res.to,
            transactionHash: res.transactionHash,
            accepted: res.accepted,
          }
          voterState.setVoteTx(voteTx)
          setVoteTx(voteTx)
          setMessage('Your Vote was submitted successfully')
          setSubmissionState(SubmissionState.CONFIRMED)
        } catch (error) {
          setMessage(`Unable to submit your vote.`)
          setSubmissionState(SubmissionState.NOT_CONFIRMED)
        }
        break
      default:
        setMessage('Please choose YES or NO first')
        setSubmissionState(SubmissionState.NOT_CONFIRMED)
    }
    setLoading(false)
  }

  const copyToClipBoard = () => {
    copy(voterState.voteTx.transactionHash)
    setCopied(true)
  }

  useEffect(() => {
    const voteTx = voterState.getVoteTx()
    setVoteTx(voteTx)
  }, [])

  const classes = useStyles()

  const isButtonDisabled =
    submissionState === SubmissionState.IN_SUBMISSION || submissionState === SubmissionState.CONFIRMED

  if (voteTx !== undefined && voteTx.transactionHash !== '') {
    return (
      <Container maxWidth="sm" style={{ marginTop: '3em' }}>
        <Card raised>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Vote Transaction
            </Typography>
            <Typography variant="subtitle2">{`This wallet has already cast a vote`}</Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FontAwesomeIcon color={mainTheme.palette.primary.main} size="2x" icon={'cube'} />
                </ListItemIcon>
                <ListItemText primary={`${voterState.voteTx.blockNumber}`} secondary={`block number`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FontAwesomeIcon color={mainTheme.palette.primary.main} size="2x" icon={'file-invoice'} />
                </ListItemIcon>
                <ListItemText
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  primary={`${voterState.voteTx.transactionHash}`}
                  secondary={`transaction hash`}
                />
                <ListItemSecondaryAction>
                  {!copied ? (
                    <IconButton edge="end" onClick={() => copyToClipBoard()}>
                      <FileCopyOutlinedIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton edge="end" onClick={() => copyToClipBoard()}>
                      <CheckOutlinedIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
          <CardActions>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => window.open(`http://localhost:6001/tx/${voterState.voteTx.transactionHash}`, '_blank')}
            >
              Inspect Transaction
            </Button>
          </CardActions>
        </Card>
      </Container>
    )
  } else {
    return (
      <div className={classes.root}>
        <div className={classes.message}>
          <Typography>{message}</Typography>
          {loading && <CircularProgress size={15} />}
          {submissionState === SubmissionState.CONFIRMED && <CheckCircleIcon color={'primary'} />}
        </div>
        <div className={classes.buttons}>
          <ToggleButtonGroup className={classes.buttons} exclusive onChange={handleToggle}>
            <ToggleButton
              disabled={isButtonDisabled}
              classes={{
                selected: classes.selected,
              }}
              className={classes.button}
              key={1}
              value="YES"
              selected={selectedVote === VotingOption.YES}
            >
              <Typography variant="h3">YES</Typography>
            </ToggleButton>
            <ToggleButton
              disabled={isButtonDisabled}
              classes={{
                selected: classes.selected,
              }}
              className={classes.button}
              key={2}
              value="NO"
              selected={selectedVote === VotingOption.NO}
            >
              <Typography variant="h3">NO</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div>
          <Button color="primary" variant="outlined" onClick={submitVote} disabled={isButtonDisabled}>
            submit
          </Button>
        </div>
      </div>
    )
  }
}

export default VotingPanel

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(4, 0),
    padding: theme.spacing(4, 2),
    textAlign: 'center',
  },
  button: {
    padding: theme.spacing(5, 8),
    height: '100%',
    width: 200,
  },
  selected: {
    '&$selected': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  buttons: {
    margin: theme.spacing(2, 0),
  },
  message: {
    height: '30px',
  },
  proof: {
    margin: theme.spacing(2, 0),
  },
  proofPaper: {
    padding: theme.spacing(2, 4),
  },
  proofButton: {},
}))
