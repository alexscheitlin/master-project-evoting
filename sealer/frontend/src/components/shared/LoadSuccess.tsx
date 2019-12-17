import { CircularProgress } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import React from 'react';
import mainTheme from '../../Theme';

interface Props {
  loading?: boolean;
  success?: boolean;
}

export const LoadSuccess: React.FC<Props> = ({ loading, success }) => {
  return (
    <>
      {loading && <CircularProgress size={24} />}
      {success && <CheckCircleIcon style={{ fontSize: 24, color: mainTheme.palette.primary.main }} />}
    </>
  );
};
