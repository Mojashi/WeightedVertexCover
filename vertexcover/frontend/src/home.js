import React from 'react';
import ReactDOM from 'react-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import ProblemList from './problemlist';
import {withRouter, Route, Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Ranking from './ranking'
import RecentSubmissions from './recentSubmission'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'

const styles = {
  app: {
      textAlign: 'center'
  }
}
class Home extends React.Component {
  
  render() {

    return (
      <Box>
      <Typography variant="h1" align="center" noWrap={true}>ここにタイトルロゴ</Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="space-around" p="20px">
        <Box flexGrow="1" paddingRight="30px">
          <ProblemList user={this.props.user} />
        </Box>
        <Box flexDirection="column" >
          <Box paddingBottom="30px">
            <Ranking />
          </Box>
          <Box paddingBottom="30px">
            <RecentSubmissions />
          </Box>
        </Box>
      </Box>
      </Box>
    );
  }
}

export default withStyles(styles)(withRouter(Home))