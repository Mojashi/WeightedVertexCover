import React, { useState, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import { withRouter, Route, Link } from 'react-router-dom'
import Box from '@material-ui/core/Box';

import {UserInfo, ChangeNameDialog} from './utils'

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { withStyles } from "@material-ui/core/styles";
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';

import Divider from '@material-ui/core/Divider';

import Collapse from '@material-ui/core/Collapse';
function getPathTitle(path) {
  if (path == '/') return "HOME";
  const elm = path.split("/");
  if (elm.length >= 3 && elm[1] == "problem") {
    return "PROBLEM:" + elm[2];
  }
}

// class NavBar extends React.Component {
//   constructor(props){

//   }
// openLoginWindow(){

//   fetch("/auth/twitter")
//     .then(response => response.json())
//     .then((json) => {
//       console.log(json['url']);
//       window.open(json['url'],"", "width=500,height=500,scrollbars=yes");
//     })
// }


const styles = theme => ({
  panelRoot: {
    top:0,
    backgroundColor: theme.palette.primary.main
  }
});

function NavBar(props){
  const user = props.user
  const {classes} = props;
  const [userPanel, setUserPanel] = useState(false);
  const [nameDialog, setNameDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // useLayoutEffect( ()=>{
  //   selfButtonElm = document.getElementById('selfInfoButton');
  // });

  return (
    <AppBar position="relative" color="primary">
      <Toolbar>
        <Typography variant="h5" color="inherit">
          {getPathTitle(props.location.pathname)}
        </Typography>
        <Box display="flex" style={{ position: "absolute", right: "24px" }}>
          <Button color="inherit" style={{ marginLeft: "10px" }} onClick={() => { props.history.push('/'); }}>
            <Typography variant="h6" color="inherit">HOME</Typography>
          </Button>
          {user !== null || <Button color="inherit" style={{ marginLeft: "10px" }} onClick={props.login}>
            <Typography variant="h6" color="inherit">LOGIN</Typography>
          </Button>}
          {user !== null &&
            <Button id="selfInfoButton" color="inherit" style={{ marginLeft: "10px" }} onClick={(e)=>{setUserPanel(p => !p);setAnchorEl(e.currentTarget)}}>
              <Typography variant="h6" color="inherit">{user['username']}</Typography>
              {userPanel ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
            </Button>
          }
          <Popper open={userPanel} anchorEl={anchorEl} placement={'bottom-end'} style={{ zIndex: 1200 }} transition>
            {({ TransitionProps }) => ( user && 
              <ClickAwayListener onClickAway={() => setUserPanel(false)}>
                <Fade {...TransitionProps} timeout={350}>
                  <Paper elevation={3} style={{ padding: '8px', }}>
                    <UserInfo user={user} />
                    <Divider />
                    <Button color="inherit" style={{ width:"100%" }} onClick={()=>{setUserPanel(false);props.logout();}}>
                      <Typography>Logout</Typography>
                    </Button>
                    <Divider />
                    <Button color="inherit" style={{ width:"100%" }} onClick={()=>{setNameDialog(true); setUserPanel(false)}}>
                      <Typography >Change UserName</Typography>
                    </Button>
                  </Paper>
                </Fade>
              </ClickAwayListener>
            )}
            {/* <Paper>
              <Typography >The content of the Popper.</Typography>
            </Paper> */}
          </Popper>
            
          {user && 
          <ChangeNameDialog open={nameDialog || !user.has_changed_username} user={user} onClose={(str)=>{
              setNameDialog(false);
            }}/>
          }

        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default withStyles(styles)(withRouter(NavBar)); 