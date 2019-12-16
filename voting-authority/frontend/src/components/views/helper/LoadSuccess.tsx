import { CircularProgress } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import React from 'react';

interface Props {
  loading?: boolean;
  success?: boolean;
  white?: boolean;
}

export const LoadSuccess: React.FC<Props> = ({ loading, success, white }) => {
  return (
    <div>
      {loading && <CircularProgress size={24} style={{ color: white ? 'white' : '' }} />}
      {success && <CheckCircleIcon style={{ fontSize: 24, color: green[500] }} />}
    </div>
  );
};
