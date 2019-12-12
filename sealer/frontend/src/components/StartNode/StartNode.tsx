import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography
} from "@material-ui/core";
import React, { useEffect, useState } from "react";

import { useInterval } from "../../hooks/useInterval";
import { SealerBackend } from "../../services";
import { delay } from "../../utils/helper";
import { LoadSuccess } from "../shared/LoadSuccess";
import { StepTitle } from "../shared/StepTitle";

interface Props {
  nextStep: () => void;
}

export const StartNode: React.FC<Props> = ({ nextStep }) => {
  const REFRESH_INTERVAL_MS: number = 3000;
  const classes = useStyles();
  const [frontendPort, setFrontendPort] = useState(
    process.env.REACT_APP_SEALER_FRONTEND_PORT
  );
  const [loading, setLoading] = useState(false);

  const [frontendPort, setFrontendPort] = useState(process.env.REACT_APP_PORT);

  const [chainSpecLoaded, setChainSpecLoaded] = useState(false);

  const [isNodeRunning, setIsNodeRunning] = useState(false);
  const [isBootNode, setIsBootNode] = useState(false);

  const [notification, setNotification] = useState("");

  const [peers, setPeers] = useState(0);

  const [isLookingForPeers, setIsLookingForPeers] = useState(false);

  const loadConfiguration = async () => {
    setLoading(true);
    setChainSpecLoaded(false);
    await delay(500);
    try {
      const success = await SealerBackend.loadConfiguration();
      setLoading(false);
      setChainSpecLoaded(true);
    } catch (error) {
      console.log(error.message);
    }
  };

  const confirmNodeIsRunning = async () => {
    await findPeers();
    setIsNodeRunning(true);
  };

  const pollPeers = async () => {
    const nrPeers = await SealerBackend.getNrPeers();
    setPeers(nrPeers);
  };

  const findPeers = async () => {
    setIsLookingForPeers(true);
    try {
      const response = await SealerBackend.findPeers();
      setIsBootNode(response.bootnode);
      if (response.bootnode) {
        setNotification(response.msg);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // only poll for peers if this node is not the bootnode
  useInterval(pollPeers, isNodeRunning ? REFRESH_INTERVAL_MS : 0);

  return (
    <div className={classes.root}>
      <StepTitle title="SEALER NODE SETUP" />
      <div className={classes.contentSection}>
        <Box textAlign="center">
          <Button
            variant="contained"
            disabled={chainSpecLoaded}
            onClick={loadConfiguration}
          >
            Load Blockchain Configuration
          </Button>
          <div className={classes.statusIcons}>
            <LoadSuccess loading={loading} success={chainSpecLoaded} />
          </div>
        </Box>
      </div>

      {chainSpecLoaded && (
        <div className={classes.contentSection}>
          <Box textAlign="center" className={classes.textBox}>
            <Typography variant="caption">
              Please start your sealer node. Once it's running confirm below.
            </Typography>
          </Box>

          <div className={classes.instructions}>
            <pre>
              <code>
                cd parity-node/ <br />
                ./run.sh{" "}
                {frontendPort && frontendPort.charAt(frontendPort.length - 1)}
              </code>
            </pre>
          </div>
          <div className={classes.confirmation}>
            <Box textAlign="center">
              {!isNodeRunning && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={confirmNodeIsRunning}
                >
                  my node is running
                </Button>
              )}
              {isNodeRunning && (
                <>
                  <Box textAlign="center">
                    <Typography>Node is runnning</Typography>
                    <div className={classes.statusIcons}>
                      <LoadSuccess loading={loading} success={isNodeRunning} />
                    </div>
                  </Box>
                </>
              )}
            </Box>
          </div>
        </div>
      )}

      {isNodeRunning && (
        <div className={classes.contentSection}>
          <Box textAlign="center" className={classes.textBox}>
            {isBootNode ? (
              <Typography variant="caption">{notification}</Typography>
            ) : (
              <Typography variant="caption">looking for peers...</Typography>
            )}
          </Box>

          <Box textAlign="center" className={classes.textBox}>
            <Typography variant="caption">
              ...connected to {peers} peers
            </Typography>
          </Box>

          <Box textAlign="center">
            <LoadSuccess loading={isLookingForPeers} />
            <Button
              className={classes.button}
              disabled={peers === 0}
              variant="contained"
              onClick={nextStep}
            >
              Next
            </Button>
          </Box>
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "relative"
    },
    button: {
      marginRight: theme.spacing(1)
    },
    statusIcons: {
      padding: theme.spacing(1, 0),
      height: 10
    },
    instructions: {
      borderRadius: 4,
      background: "#212121",
      color: "white",
      padding: theme.spacing(1),
      margin: "auto",
      fontSize: "0.8em",
      width: "50%"
    },
    confirmation: {
      padding: theme.spacing(2, 0)
    },
    wrapper: {
      display: "flex",
      alignItems: "center"
    },
    statusButtonWrapper: {
      marginLeft: 10
    },
    sealerInfo: {
      padding: theme.spacing(3, 0)
    },
    successIcon: {
      position: "absolute",
      bottom: 0,
      right: 0
    },
    loader: {
      position: "absolute",
      bottom: 0,
      right: 0
    },
    textBox: {
      width: 400,
      margin: "auto"
    },
    contentSection: {
      padding: theme.spacing(1)
    }
  })
);
