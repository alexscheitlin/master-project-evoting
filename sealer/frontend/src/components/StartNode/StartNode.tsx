import {
  Button,
  CircularProgress,
  createStyles,
  makeStyles,
  Theme,
  Typography,
  Box,
  Divider
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";

import { config } from "../../config";
import { SealerBackend } from "../../services";
import { delay } from "../../utils/helper";

interface Props {
  nextStep: () => void;
}

export const StartNode: React.FC<Props> = ({ nextStep }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [isNodeRunning, setIsNodeRunning] = useState(false);

  const [peers, setPeers] = useState(0);

  const [isLookingForPeers, setIsLookingForPeers] = useState(false);

  let intervalID = 0;

  const loadConfiguration = async () => {
    setLoading(true);
    setSuccess(false);
    await delay(1000);
    const success = await SealerBackend.loadConfiguration();
    setLoading(false);
    setSuccess(success);
  };

  const confirmNodeIsRunning = () => {
    setIsNodeRunning(true);
  };

  const pollPeers = async () => {
    const nrPeers = await SealerBackend.getNrPeers();
    setPeers(nrPeers);
  };

  const findPeers = async () => {
    setIsLookingForPeers(true);
    const success = await SealerBackend.findPeers();
    if (success) {
      intervalID = window.setInterval(pollPeers, 2000);
    } else {
      throw new Error("Could not find peers");
    }
  };

  useEffect(() => {
    return () => {
      window.clearInterval(intervalID);
    };
  });

  return (
    <div className={classes.root}>
      <Typography variant="h3">SEALER NODE</Typography>
      <div className={classes.button}>
        <Box textAlign="center">
          <Button
            variant="contained"
            disabled={success}
            onClick={loadConfiguration}
          >
            Load Blockchain Configuration
          </Button>
          <div className={classes.statusIcons}>
            {success && (
              <CheckCircleIcon style={{ fontSize: 24, color: green[500] }} />
            )}
            {loading && <CircularProgress size={24} />}
          </div>
        </Box>
      </div>

      {success && (
        <div>
          <Divider />
          <Box textAlign="center">
            <Typography variant="h6">start your sealer node</Typography>
          </Box>
          <div className={classes.instructions}>
            <pre>
              <code>
                cd parity-node/ <br />
                ./run.sh 0
              </code>
            </pre>
          </div>
          <div className={classes.confirmation}>
            <Box textAlign="center">
              {!isNodeRunning && (
                <>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={confirmNodeIsRunning}
                  >
                    my node is running
                  </Button>
                </>
              )}
              {isNodeRunning && (
                <>
                  <Typography>Node is runnning</Typography>
                  <Box textAlign="center">
                    <CheckCircleIcon
                      style={{ fontSize: 24, color: green[500] }}
                    />
                  </Box>
                </>
              )}
            </Box>
          </div>
          <Divider />
        </div>
      )}
      {isNodeRunning && (
        <div>
          <Divider />
          <Box textAlign="center">
            {!isLookingForPeers && (
              <>
                <Typography variant="h6">find peers on network</Typography>
                <Button variant="contained" onClick={findPeers}>
                  find peers
                </Button>
              </>
            )}
            {isLookingForPeers && (
              <>
                <Typography>Looking for peers</Typography>
                <Box textAlign="center">
                  <CircularProgress size={24} />
                  <div>{peers} peers </div>
                </Box>
                <Button
                  disabled={peers === 0}
                  variant="contained"
                  onClick={nextStep}
                >
                  Next
                </Button>
              </>
            )}
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
      padding: theme.spacing(3, 0)
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
      fontSize: "0.8em"
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
    }
  })
);
