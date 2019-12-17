import red from '@material-ui/core/colors/red';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

// A custom theme for this app
const mainTheme = createMuiTheme({
  palette: {
    primary: {
      // main: '#8F799C',
      main: '#1D3557',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  typography: {
    fontSize: 16,
  },
});

export default responsiveFontSizes(mainTheme);
