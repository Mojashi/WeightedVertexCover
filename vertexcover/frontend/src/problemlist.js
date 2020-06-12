import React from 'react';
import ReactDOM from 'react-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Button from'@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {withRouter, Route, Link } from 'react-router-dom'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import VertexCoverGame from'./graphview';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import CircularProgress from '@material-ui/core/CircularProgress';

class ProblemList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      problems:null,
      total_pages:5,
      page_number:1,
      open:{},
      fetchingNow:null,
    }
    this.opencloseListElement = this.opencloseListElement.bind(this);
  }

  componentDidMount(){
    this.fetchProblemList();
  }

  fetchProblemList(pageNum=1) {
    this.setState({fetchingNow:pageNum});

    fetch("/api/problems/?page=" + pageNum)
      .then(response => response.json())
      .then((json) => {
        if (json.page_number === this.state.fetchingNow) {
          console.log(json);
          this.setState({
            problems: json.results,
            total_pages: json.total_pages,
            page_number: json.page_number,
            fetchingNow: null
          });
        }
      })
      .catch(function (err) {
        console.error(err);
      })
  }

  opencloseListElement(id){
    const open = this.state.open;
    open[id] = !open[id];
    this.setState( {
      open:open
    });
  }

  goNextPage(){
    if(this.state.page_number < this.state.total_pages)
      this.fetchProblemList(this.state.page_number + 1);
  }
  goPreviousPage(){
    if(this.state.page_number > 1)
      this.fetchProblemList(this.state.page_number - 1);
  }

  render() {
    if(this.props.user)
      console.log(this.props.user.solvedProblems)
    
    return (
      <Box borderRadius="10px 10px 0px 0px" component={Paper}>
        <Box bgcolor="secondary.main" color="white" borderRadius="10px 10px 0px 0px">
          <Toolbar >
            <Typography variant="h5">
              Problems
            </Typography>
          </Toolbar>
        </Box>

        <Box display="flex">
          <IconButton onClick={()=>{this.goPreviousPage();}}><ArrowBackIosIcon/></IconButton>
          {[...Array(Math.floor(Math.sqrt(this.state.total_pages))).keys()].map((i)=>
            <Button key={(i+1)*(i+1)} onClick={()=>{this.fetchProblemList((i+1)*(i+1));}}>
              <Typography >{(i+1)*(i+1)}</Typography>
            </Button>
          )}
          <IconButton onClick={()=>{this.goNextPage();}}><ArrowForwardIosIcon/></IconButton>
          
          <Typography style={{ paddingTop:'12px', paddingBottom:'12px',}}>{"page:"+this.state.page_number + "/" + this.state.total_pages}</Typography>
        </Box>

        {this.state.fetchingNow ?
          <Box align="center"> 
            <CircularProgress color="secondary"/> 
          </Box> :

          <List>
            {this.state.problems && this.state.problems.map((problem) =>
              <Box key={problem.id}>
                <ListItem button onClick={() => { this.props.history.push('/problem/' + problem.id); }}>

                  <ListItemIcon>
                    {this.props.user && this.props.user.solvedProblems.includes(problem.id) ?
                      <CheckCircleOutlineIcon color='primary'/> : <RadioButtonUncheckedIcon />
                    }
                  </ListItemIcon>


                  <ListItemText primary={"PROBLEM " + problem.id} secondary={"頂点数:" + problem.nOfVertices + " OPT:" + problem.OPT + " Solved:" + problem.solvedCount + "人" + " 提出数:" + problem.submissionCount} />

                  <IconButton onClick={(e) => { this.opencloseListElement(problem.id); e.stopPropagation(); }} onMouseDown={(e) => { e.stopPropagation(); }}>
                    {this.state.open[problem.id] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </ListItem>

                <Collapse in={this.state.open[problem.id]} timeout="auto" unmountOnExit>
                  <Box height="200px">
                    <VertexCoverGame problemId={problem.id} justView={true} />
                  </Box>
                </Collapse>
              </Box>
            )
            }
          </List>
        }

        {/* <Box display="flex" flexDirection="column">
          {this.state.problems && this.state.problems.map((problem) =>
            <Box component={Paper} m="10px">
              <Button onClick={() => { this.props.history.push('/problem/' + problem.id); }} key={problem.id} >
                <Box align="left"> {"PROBLEM" + problem.id + "Vertices:" + problem.vertices.length + " Solved:" + problem.solvedCount} </Box>
              </Button>
            </Box>
          )
          }
        </Box> */}
      </Box>
    );
  }
}

export default withRouter(ProblemList)