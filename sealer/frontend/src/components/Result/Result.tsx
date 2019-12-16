import React from 'react';
import { Box, Theme, createStyles, ListItem, List, Typography } from '@material-ui/core';
import { StepTitle } from '../shared/StepTitle';
import { makeStyles } from '@material-ui/styles';

interface Props {}

export const Result: React.FC<Props> = () => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <StepTitle title="Result" />
      <List>
        <ListItem>
          <Typography variant="h6">You are all done, the process ends here.</Typography>
        </ListItem>
      </List>
    </Box>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
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
);
