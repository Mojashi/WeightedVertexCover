import React from 'react';
import ReactDOM from 'react-dom';
import VertexCoverGame from './graphview'
import NavBar from './NavBar'
import Home from './home'
import {useLocation ,Switch,Redirect, BrowserRouter, Route, Link } from 'react-router-dom'
import { createMuiTheme } from '@material-ui/core/styles';
import EventListener from 'react-event-listener';

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.state = {
            user:null
        }
    }
    componentDidMount() {
        this.fetchUserInfo();
    }
    fetchUserInfo() {
        fetch("/api/users/me/")
            .then(response => response.json())
            .then((json) => {
                console.log(json);
                if (json['id']) {
                    json['reload'] = this.fetchUserInfo;
                    this.setState({ user: json });
                }
            })
    }
    login() {
        fetch("/auth/twitter")
            .then(response => response.json())
            .then((json) => {
                console.log(json['url']);
                var authWindow = window.open(json['url'], "", "width=500,height=500,scrollbars=yes");
                if(authWindow)
                var timer = setInterval((ev) => {
                    if(authWindow.closed) {
                        clearInterval(timer);
                        this.fetchUserInfo();
                    }
                }, 1000);
            })
    }

    logout() {
        fetch("/logout")
            .then(response => response.json())
            .then((json) => {
                console.log(json);
                this.setState({user:null});
            })
    }

    render() {
        return (
            <BrowserRouter>
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                    <div id="navbar">
                        <NavBar user={this.state.user} login={this.login} logout={this.logout}/>
                    </div>
                    <div style={{ width: "100%", flex: "1", position: "relative", overflow: "auto" }}>
                        <Switch>
                            <Route path='/problem/:problemId' render={props=><VertexCoverGame user={this.state.user} problemId={props.match.params.problemId} {...props}/>} />
                            <Route exact path='/' render={props=><Home user={this.state.user} {...props}/>} />
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>

        )
    }
}
