import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const StepContentWrapper: React.FC<Props> = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.root}>{children}</div>;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    minHeight: 700
  }
}));
