import { Box, Typography } from '@material-ui/core';
import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
}

export const StepTitle: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <Box style={{ paddingLeft: '16px' }}>
      <Typography variant="h2" style={{ margin: '4px 0 8px 0' }}>
        {title}
      </Typography>
      {subtitle && <Typography variant="h5">{subtitle}</Typography>}
    </Box>
  );
};
