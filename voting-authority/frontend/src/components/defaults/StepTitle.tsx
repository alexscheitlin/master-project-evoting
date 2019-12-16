import { Box, Typography } from '@material-ui/core';
import React from 'react';

interface Props {
  title: string;
}

export const StepTitle: React.FC<Props> = ({ title }) => {
  return (
    <Box>
      <Typography variant="h2" style={{ margin: '4px 0 8px 0', paddingLeft: '16px' }}>
        {title}
      </Typography>
    </Box>
  );
};
