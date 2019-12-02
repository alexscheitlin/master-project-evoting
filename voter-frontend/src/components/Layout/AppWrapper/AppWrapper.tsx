import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles(theme => ({
  wrapper: {
    margin: theme.spacing(0),
  },
}));

interface Props {
  children: React.ReactNode;
}

const AppWrapper: React.FC<Props> = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.wrapper}>{children}</div>;
};

export default AppWrapper;
