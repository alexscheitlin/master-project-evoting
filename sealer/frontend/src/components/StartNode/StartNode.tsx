import { Button, createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme } from '@material-ui/core'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import GetAppIcon from '@material-ui/icons/GetApp'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import React, { useState } from 'react'

import { useInterval } from '../../hooks/useInterval'
import { SealerBackend } from '../../services'
import { delay } from '../../utils/helper'
import { StepContentWrapper } from '../Helpers/StepContentWrapper'
import { LoadSuccess } from '../shared/LoadSuccess'
import { StepTitle } from '../shared/StepTitle'

interface Props {
  nextStep: () => void
}

export const StartNode: React.FC<Props> = ({ nextStep }) => {
  const REFRESH_INTERVAL_MS = 3000
  const classes = useStyles()

  const frontendPort = process.env.REACT_APP_SEALER_FRONTEND_PORT

  const [loading, setLoading] = useState(false)

  const [chainSpecLoaded, setChainSpecLoaded] = useState(false)

  const [isNodeRunning, setIsNodeRunning] = useState(false)
  const [isBootNode, setIsBootNode] = useState(false)

  const [peers, setPeers] = useState(0)

  const loadConfiguration = async (): Promise<void> => {
    setLoading(true)
    setChainSpecLoaded(false)
    await delay(1000)
    try {
      await SealerBackend.loadConfiguration()
      setLoading(false)
      setChainSpecLoaded(true)
    } catch (error) {
      console.log(error.message)
    }
  }

  const confirmNodeIsRunning = async (): Promise<void> => {
    // try to register myself
    await registerMySealerNode()

    const nrPeers = await SealerBackend.getNrPeers()
    setPeers(nrPeers)

    // this activates the polling of the peers
    setIsNodeRunning(true)
  }

  const registerMySealerNode = async (): Promise<void> => {
    try {
      const response = await SealerBackend.registerMySealerNode()
      setIsBootNode(response.bootnode)
    } catch (error) {
      console.log(error.message)
    }
  }

  const pollPeers = async (): Promise<void> => {
    const nrPeers = await SealerBackend.getNrPeers()
    setPeers(nrPeers)
  }

  // only poll for peers if this node is not the bootnode
  useInterval(pollPeers, isNodeRunning ? REFRESH_INTERVAL_MS : 0)

  return (
    <StepContentWrapper>
      <StepTitle title="Start Node" />
      <List>
        <ListItem>
          {!loading && !chainSpecLoaded ? (
            <ListItemIcon>
              <FiberManualRecordIcon />
            </ListItemIcon>
          ) : null}
          {loading || chainSpecLoaded ? (
            <ListItemIcon>
              <LoadSuccess loading={loading} success={chainSpecLoaded} />
            </ListItemIcon>
          ) : null}

          <ListItemText primary={'Load Blockchain Configuration'} />
          {!chainSpecLoaded && (
            <Button disabled={chainSpecLoaded} onClick={loadConfiguration}>
              <GetAppIcon />
            </Button>
          )}
        </ListItem>
        {chainSpecLoaded && (
          <>
            <ListItem>
              {!isNodeRunning ? (
                <ListItemIcon>
                  <FiberManualRecordIcon />
                </ListItemIcon>
              ) : (
                <ListItemIcon>
                  <LoadSuccess loading={loading} success={isNodeRunning} />
                </ListItemIcon>
              )}

              <ListItemText primary={`Please start your sealer node. Confirm once it's running.`} />
              {!isNodeRunning && (
                <Button variant="outlined" onClick={confirmNodeIsRunning}>
                  confirm
                </Button>
              )}
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <KeyboardArrowRightIcon />
              </ListItemIcon>
              <div className={classes.instructions}>
                <pre>
                  <code>
                    cd parity-node/ <br />
                    ./run.sh {frontendPort && frontendPort.charAt(frontendPort.length - 1)}
                  </code>
                </pre>
              </div>
            </ListItem>
            {isNodeRunning && (
              <>
                <ListItem>
                  <ListItemIcon>
                    <LoadSuccess success={true} />
                  </ListItemIcon>
                  <ListItemText primary={`Established connection with the authority.`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LoadSuccess loading={true} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      isBootNode
                        ? `You are the bootnode. Please wait for other sealers to connect.`
                        : `Looking for peers to connect to..`
                    }
                    secondary={`connected to ${peers} peers`}
                  />
                </ListItem>
              </>
            )}
          </>
        )}
      </List>

      <List className={classes.nextButton}>
        <ListItem>
          <Button
            className={classes.button}
            disabled={peers === 0}
            variant="contained"
            color="primary"
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
    instructions: {
      borderRadius: 4,
      background: '#212121',
      color: 'white',
      padding: theme.spacing(1),
      fontSize: '1.1em',
      width: '50%',
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
