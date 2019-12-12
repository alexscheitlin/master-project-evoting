import { Box, Typography } from "@material-ui/core";
import React from "react";

interface Props {
  title: string;
}

export const StepTitle: React.FC<Props> = ({ title }) => {
  return (
    <Box textAlign="center">
      <Typography variant="h3" style={{ margin: "4px 0 8px 0" }}>
        {title}
      </Typography>
    </Box>
  );
};
