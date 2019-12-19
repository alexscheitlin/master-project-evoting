import { Container, List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import InfoIcon from '@material-ui/icons/Info'
import React from 'react'

const NotOpen: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <List>
        <ListItem>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="h5">Currently no vote ongoing.</Typography>
          </ListItemText>
        </ListItem>
      </List>
    </Container>
  )
}

export default NotOpen
