import React, {useState,useLayoutEffect, useEffect} from 'react';
import ReactDOM from 'react-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';

import { withStyles } from '@material-ui/core/styles';
import MaterialTooltip from "@material-ui/core/Tooltip";

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import CircularProgress from '@material-ui/core/CircularProgress';
import FormHelperText from '@material-ui/core/FormHelperText';

export function UserInfo(props) {
  const user = props.user;

  return (
      <Grid container spacing={2} direction="column">
          <Grid item xs>
              <Link href={"https://twitter.com/"+user.twitter_screenname} underline="none" target="_blank" rel="noopener"><Typography align="center" variant="h6">{user.username}</Typography></Link>
          </Grid>

          <Grid item container xs>

              <Grid container spacing={2} direction="row">
                  <Grid item xs>
                      <img src={user.twitter_pic_url.replace('_normal.', '_bigger.')}/>
                  </Grid>
                  <Grid item xs>
                      <Box display='block'>
                          <Typography align="center">Accepted</Typography>
                          <Typography align="center">{user.solvedCount}</Typography>
                      </Box>
                  </Grid>
              </Grid>

          </Grid>
      </Grid>
  );
}

export const LightTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[3],
    fontSize: 11
  },
  arrow: {
    color: "white"
  }
}))(MaterialTooltip);

export function UserTableCell(props) {
  const user = props.user

  return (
  <LightTooltip interactive arrow title={<UserInfo user={user} />}>
    <TableCell style={{ display: "flex", flexDirection: "row-reverse" }}>
      <Typography>{user.username}</Typography>
      <img src={user.twitter_pic_url.replace('_normal.', '_mini.')} style={{ marginRight: "1em" }} />
    </TableCell>
  </LightTooltip>
  );
}

export function ChangeNameDialog(props){
  const open = props.open;
  const user = props.user;
  const onClose = props.onClose;

  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [waiting, setWaiting] = React.useState(false);
  const handleChange = (event) => {
    if(event.target.value.length < 13)
      setName(event.target.value);
      setError('');
  };

  const changeNameRequest = () => {
    setWaiting(true);
    const csrftoken = getCookie('csrftoken');
    fetch("/api/setname/", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ 'new_username': name})
    })
        .then(response => response.json())
        .then((json) => {
          setWaiting(false);
          if(json.status == "success"){
            user.reload();
            onClose("changed");
          }
          else {
            setError(json.reason);
          }
        });
  };

  return (
    <Dialog open={open}>
    <ClickAwayListener onClickAway={()=>onClose("away")}>
      <div>
      <DialogTitle id="form-dialog-title">Change your username</DialogTitle>
      <DialogContent>
          <DialogContentText>
            Enter your new username and press OK button.(The length must be no more than 13 characters.)
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={name}
            onChange={handleChange}
            id="name"
            label="User Name"
            type="text"
            fullWidth
            error={error != ''}
          />
          <FormHelperText id="error-text">{error}</FormHelperText>
        </DialogContent>
        <DialogActions>
          {waiting ? 
            <CircularProgress color="primary"/> : 
            <Button type="submit" onClick={changeNameRequest} color="primary">
              OK
            </Button>
          }
        </DialogActions>
        </div>
    </ClickAwayListener>
    </Dialog>
  );
}

export function getCookie(name) {
    var result = null;
    var cookieName = name + '=';
    var allcookies = document.cookie;
    var position = allcookies.indexOf(cookieName);
    if (position != -1) {
        var startIndex = position + cookieName.length;
        var endIndex = allcookies.indexOf(';', startIndex);
        if (endIndex == -1) {
            endIndex = allcookies.length;
        }
        result = decodeURIComponent(allcookies.substring(startIndex, endIndex));
    }
    return result;
}
