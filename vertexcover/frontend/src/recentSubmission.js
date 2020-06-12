import React from 'react';
import ReactDOM from 'react-dom';
import { withRouter, Route, Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

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

import {UserTableCell} from './utils'

const styles = {
  app: {
    textAlign: 'center'
  }
}

class RecentSubmissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: null
    }
  }

  componentDidMount() {
    this.fetchSubmissions();
  }

  fetchSubmissions() {
    fetch("/api/submissions/?ordering=-submitted_at")
      .then(response => response.json())
      .then((json) => {
        console.log(json);
        this.setState({ submissions: json.results });
      })
      .catch(function (err) {
        console.error(err);
      })
  }
  render() {


    return (

      <Box borderRadius="10px 10px 0px 0px">
        <Box bgcolor="secondary.main" color="white" borderRadius="10px 10px 0px 0px">
          <Toolbar >
            <Typography variant="h5">
              Recent Submissions
          </Typography>
          </Toolbar>
        </Box>
        <TableContainer component={Paper}>
          <Table >
            <TableHead>
              <TableRow>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Prob</TableCell>
                <TableCell align="right">User</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.submissions && this.state.submissions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell align="right">{row.submitted_at}</TableCell>
                  <TableCell align="right" style={{cursor:'pointer'}} onClick={()=>this.props.history.push('/problem/' + row.problem.id)}>{row.problem.id}</TableCell>
                  <UserTableCell user={row.user} />
                  <TableCell align="right">{row.problem.OPT == row.score ? "OPT!" : row.score + "/" + row.problem.OPT}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
}

export default withStyles(styles)(withRouter(RecentSubmissions))