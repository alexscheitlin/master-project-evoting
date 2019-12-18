import { Box, createStyles, List, ListItem, ListItemText, Theme, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import React from 'react'

import { stepDescriptions } from '../../utils/descriptions'
import { StepTitle } from '../shared/StepTitle'

export const Result: React.FC = () => {
  const classes = useStyles()
  return (
    <Box className={classes.root}>
      <StepTitle title="Result" />
      <List>
        <ListItem>
          <ListItemText>{stepDescriptions.result}</ListItemText>
        </ListItem>

        <ListItem>
          <Typography variant="h6">TODO: add result of the vote</Typography>
        </ListItem>
      </List>
    </Box>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      minHeight: 700,
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
)
