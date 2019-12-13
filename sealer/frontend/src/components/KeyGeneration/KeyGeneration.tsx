import React, { useState } from "react";
import {
  Theme,
  createStyles,
  makeStyles,
  Button,
  Box,
  Typography
} from "@material-ui/core";
import { SealerBackend } from "../../services";
import { LoadSuccess } from "../shared/LoadSuccess";
import { StepTitle } from "../shared/StepTitle";

interface Props {
  nextStep: () => void;
}

export const KeyGeneration: React.FC<Props> = ({ nextStep }) => {
  const classes = useStyles();

  const [keysSubmitted, setKeysSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateKeys = async () => {
    try {
      setLoading(true);
      await SealerBackend.generateKeys();
      setLoading(false);
      setKeysSubmitted(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={classes.root}>
      <Box textAlign="center">
        <StepTitle title="Key generation" />
        <div className={classes.contentSection}>
          <Button
            variant="contained"
            color="default"
            onClick={generateKeys}
            disabled={keysSubmitted}
          >
            Generate and Submit Keyshare
          </Button>
          <div className={classes.statusIcons}>
            <LoadSuccess success={keysSubmitted} loading={loading} />
            {keysSubmitted && (
              <Box textAlign="center" className={classes.textBox}>
                <Typography variant="caption">Keys submitted.</Typography>
              </Box>
            )}
          </div>
        </div>

        <div className={classes.contentSection}>
          <Button
            variant="contained"
            color="default"
            disabled={!keysSubmitted}
            onClick={nextStep}
          >
            Next
          </Button>
        </div>
      </Box>
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "relative"
    },
    contentSection: {
      padding: theme.spacing(1)
    },
    statusIcons: {
      padding: theme.spacing(1, 0),
      height: 30
    },
    textBox: {
      width: 400,
      margin: "auto"
    }
  })
);
