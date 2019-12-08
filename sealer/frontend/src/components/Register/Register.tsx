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
import clsx from "clsx";
import React, { useEffect, useState } from "react";

import { SealerBackend } from "../../services";
import { delay } from "../../utils/helper";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      alignItems: "center"
    },
    wrapper: {
      display: "flex",
      alignItems: "center"
    },
    buttonSuccess: {
      backgroundColor: green[500],
      "&:hover": {
        backgroundColor: green[700]
      }
    },
    buttonProgress: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12
    },
    statusButtonWrapper: {
      marginLeft: 10
    }
  })
);

interface Props {}

export const Register: React.FC<Props> = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [wallet, setWallet] = useState("");

  useEffect(() => {
    async function init() {
      const address = await SealerBackend.getWalletAddress();
      setWallet("0x" + address);
    }
    init();
    return () => {};
  }, []);

  const register = async () => {
    try {
      setSuccess(false);
      setLoading(true);
      await SealerBackend.registerWallet(wallet);
      await delay(1000);
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(true);
      setErrorMsg(
        "Could not register Address. You are probably already registered."
      );
    }
  };

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success
  });

  return (
    <div>
      <Typography>
        <strong>Sealer Wallet: </strong> {wallet}
      </Typography>
      <div className={classes.wrapper}>
        <Button
          className={buttonClassname}
          variant="contained"
          color="primary"
          disabled={loading || success}
          onClick={register}
        >
          Register Wallet
        </Button>
        <div className={classes.statusButtonWrapper}>
          {loading && <CircularProgress size={24} />}
          {success && (
            <CheckCircleIcon style={{ fontSize: 24, color: green[500] }} />
          )}
        </div>
      </div>
      <div>{error && <div>{errorMsg}</div>}</div>
    </div>
  );
};
