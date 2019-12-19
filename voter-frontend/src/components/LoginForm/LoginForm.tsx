import { CircularProgress, Paper, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import CssBaseline from '@material-ui/core/CssBaseline'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import React, { useState } from 'react'
import { useVoterStore } from '../../store'
import ErrorIcon from '@material-ui/icons/Error'

interface Props {
  onLogin: (username: string, password: string) => void
  loading: boolean
  error: boolean
  msg: string
}

const LoginForm: React.FC<Props> = ({ onLogin, loading, error, msg }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const voterState = useVoterStore()
  const classes = useStyles()

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper className={classes.paper} elevation={2}>
        <Typography component="h1" variant="body2">
          Please sign in with your Swiss E-Identity
        </Typography>
        <form className={classes.form} autoComplete="off">
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            onChange={(e): void => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e): void => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={(): void => onLogin(username, password)}
            disabled={loading}
          >
            {!loading && <div>submit</div>}
            {loading && <CircularProgress size={24} />}
          </Button>
        </form>
        {voterState.error && (
          <div>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="primary" />
                </ListItemIcon>
                <ListItemText color="#ffffff">{voterState.message}</ListItemText>
              </ListItem>
            </List>
          </div>
        )}

        {error && <Typography>{msg}</Typography>}
      </Paper>
    </Container>
  )
}

export default LoginForm

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    height: 35,
  },
}))
