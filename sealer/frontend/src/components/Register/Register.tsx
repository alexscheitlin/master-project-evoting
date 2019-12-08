import {
  Button,
  CircularProgress,
  createStyles,
  makeStyles,
  Theme,
  Typography
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";

import { config } from "../../config";
import { SealerBackend } from "../../services";
import { delay } from "../../utils/helper";

interface StateResponse {
  state: any;
  registeredSealers: number;
  requiredSealers: number;
}

interface Props {
  nextStep: () => void;
}

export const Register: React.FC<Props> = ({ nextStep }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [wallet, setWallet] = useState("");

  const [state, setState] = useState();
  const [requiredSealers, setRequiredSealers] = useState<number>(3);
  const [sealers, setSealers] = useState<string[]>([]);
  const [listening, setListening] = useState<boolean>(false);

  const [readyForNextStep, setReadyForNextStep] = useState<boolean>(false);

  useEffect(() => {
    setReadyForNextStep(requiredSealers === sealers.length);
  }, [sealers, requiredSealers]);

  useEffect(() => {
    const getRequiredValidators = async () => {
      try {
        const response: AxiosResponse<StateResponse> = await axios.get(
          config.authBackend.devUrl + "/state"
        );
        if (response.status === 201) {
          setRequiredSealers(response.data.requiredSealers);
          setState(response.data.state);
        } else {
          throw new Error(
            `GET /state -> status code not 200. Status code is: ${response.status}`
          );
        }
      } catch (error) {
        console.log("ERROR");
      }
    };

    getRequiredValidators();
  }, []);

  useEffect(() => {
    if (!listening) {
      const events = new EventSource(config.authBackend.devUrl + "/registered");
      events.onmessage = event => {
        const parsedData = JSON.parse(event.data);
        setSealers(sealers => sealers.concat(parsedData));
      };

      setListening(true);
    }
  }, [listening, sealers]);

  useEffect(() => {
    async function init() {
      const address = await SealerBackend.getWalletAddress();
      setWallet(address);
    }
    init();
    return () => {};
  }, []);

  const register = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      await delay(1000);
      await SealerBackend.registerWallet(wallet);
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setSuccess(true);
      setError(true);
      console.log(error);
      setErrorMsg(
        "Could not register Address. You are probably already registered."
      );
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h3">REGISTRATION</Typography>
      <Typography>
        <strong>Sealer Wallet: </strong> {wallet}
      </Typography>
      <div className={classes.sealerInfo}>
        <Typography variant="body2">
          {sealers.length} of {requiredSealers} Sealers registered
        </Typography>
      </div>
      <div className={classes.wrapper}>
        <Button
          className={classes.button}
          variant="contained"
          disabled={loading}
          onClick={register}
        >
          Submit
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          disabled={!readyForNextStep}
          onClick={nextStep}
          color="primary"
        >
          Next
        </Button>
      </div>
      <div className={classes.successIcon}>
        <div className={classes.statusButtonWrapper}>
          {loading && <CircularProgress size={24} />}
        </div>
        {success && (
          <CheckCircleIcon style={{ fontSize: 24, color: green[500] }} />
        )}
      </div>
      <Typography variant="caption">{error && errorMsg}</Typography>
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "relative"
    },
    wrapper: {
      display: "flex",
      alignItems: "center"
    },
    button: {
      marginRight: theme.spacing(1)
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
