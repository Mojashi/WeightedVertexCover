import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';

const theme = createMuiTheme({
  type: 'light',
  palette: {
    primary: {
      light: '#757ce8', // 基本の色よりも明るい色
      main: '#3f50b5', // 基本の色
      dark: '#002884', // 基本の色よりも暗い色
      contrastText: '#fff', // テキストの色
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});
ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>,
  document.getElementById('root')
);
  