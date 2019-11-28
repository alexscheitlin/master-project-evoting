import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  wrapper: {
    height: '100vh',
    padding: theme.spacing(2),
    margin: theme.spacing(0),
  },
}));

interface Props {
  children: React.ReactNode;
}

const AppWrapper: React.FC<Props> = ({children}) => {
  const classes = useStyles();
  return <div className={classes.wrapper}>{children}</div>;
};

export default AppWrapper;
