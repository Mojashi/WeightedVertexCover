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
import MaterialTooltip from "@material-ui/core/Tooltip";

import {UserTableCell} from './utils'

const styles = {
    app: {
        textAlign: 'center'
    }
}

class Ranking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ranking: null
        }
    }

    componentDidMount() {
        this.fetchRanking();
    }

    fetchRanking() {
        fetch("/api/users/?ordering=-solvedCount")
            .then(response => response.json())
            .then((json) => {
                console.log(json);
                this.setState({ ranking: json.results });
            })
            .catch(function (err) {
                console.error(err);
            })
    }
    render() {
        const rows = [],ranking = this.state.ranking, classes = this.props.classes;
        for(let i = 0; ranking&&Math.min(10,ranking.length) > i; i++){
        rows.push({ rank: i + 1, user: ranking[i]});
    }

    return (
      <Box borderRadius="10px 10px 0px 0px">
        <Box bgcolor="secondary.main" color="white" borderRadius="10px 10px 0px 0px">
          <Toolbar >
            <Typography variant="h5">
              Ranking
          </Typography>
          </Toolbar>
        </Box>
        <TableContainer component={Paper}>
          <Table >
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell align="right">User</TableCell>
                <TableCell align="right">Solved</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.user.id}>
                  <TableCell component="th" scope="row">
                    {row.rank}
                  </TableCell>
                  <UserTableCell user={row.user}/>
                  <TableCell align="right">{row.user.solvedCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
}

export default withStyles(styles)(withRouter(Ranking))