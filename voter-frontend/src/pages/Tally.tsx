import { CircularProgress, Container, List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import React from 'react'

const Tally: React.FC = () => {
  return (
    <Container maxWidth="md">
      <List>
        <ListItem>
          <ListItemIcon>
            <CircularProgress size={36} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="h5">Vote is closed. Results will be available shortly.</Typography>
          </ListItemText>
        </ListItem>
      </List>
    </Container>
  )
}

export default Tally
