import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import DoneOutlineIcon from '@material-ui/icons/DoneOutline';
import EventListener from 'react-event-listener';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withTheme } from 'material-ui/styles';
import { withStyles } from "@material-ui/core/styles";
import ReactTooltip from 'react-tooltip'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Drawer from '@material-ui/core/Drawer';
import clsx from 'clsx';
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {Rule} from './rule'
import { UserTableCell, getCookie } from './utils'
import HelpIcon from '@material-ui/icons/Help';
import Fade from '@material-ui/core/Fade';

import Slider from '@material-ui/core/Slider';
import Popper from '@material-ui/core/Popper';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(p) {
        this.x += p.x;
        this.y += p.y;
    }
    sub(p) {
        this.x -= p.x;
        this.y -= p.y;
    }
    mul(x) {
        this.x *= x;
        this.y *= x;
    }
}

class Vertex extends React.Component {
    render() {
        const center = this.props.center, r = this.props.r;
        return (
            <g onClick={this.props.onClick} onDoubleClick={this.props.onDoubleClick} onMouseUp={this.props.onMouseUp} onMouseDown={this.props.onMouseDown} style={{ cursor: "pointer" }}>

                <circle cx={center.x} cy={center.y} r={r} fill={this.props.selected ? "#302A62" : "#FFFFFF"} stroke={this.props.fixed ? "rgb(244, 67, 54)" : "#1C1445"} strokeWidth={2}></circle>
                <text x={center.x} y={center.y} fontSize="24" dominantBaseline="central" textAnchor="middle" style={{ userSelect: "none" }} strokeWidth={2} stroke={!this.props.selected ? "#302A62" : "#FFFFFF"} fill={!this.props.selected ? "#302A62" : "#FFFFFF"}>{this.props.children}</text>
            </g>
        );
    }
}


class Edge extends React.Component {
    render() {
        const from = this.props.from, to = this.props.to;
        return (
            <g>
                <path d={"M " + from.x + " " + from.y + " L " + to.x + " " + to.y} stroke={this.props.selected ? "#C2BACB" : "#1C1445"} strokeWidth={2} ></path>
            </g>
        );
    }
}

class VertexPhysics {
    constructor(id, pos) {
        this.id = id;
        this.velocity = new Point(0, 0);
        this.pos = new Point(pos.x, pos.y);
    }
}
class VertexAppearence {
    constructor(id) {
        this.id = id;
        this.text = this.id;
        this.selected = false;
        this.weight = 1;
        this.fixed = false;
    }
}

class EdgeAppearence {
    constructor(id, from, to) {
        this.from = from;
        this.to = to;
        this.id = id;
        this.text = "";
        this.selected = false;
    }
}

function getRandomInt(min, max) { // [l,r]
    return Math.floor(Math.random() * (max - min)) + min;
}

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.handleVertexDragStart = this.handleVertexDragStart.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleReleaseVertex = this.handleReleaseVertex.bind(this);
        this.updateVertexPos = this.updateVertexPos.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleViewBoxDragStart = this.handleViewBoxDragStart.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.vertexRadius = 30;
        this.state = {
            vertexPoss: [],
            timerId: null,
            dragBeforePos: null,
            draggingVertex: null,
            draggingViewBox: false,
            dragTimerId: null,
            originalBoxSize: new Point(0, 0),
            viewBoxScale: 1,
            viewBoxPos: new Point(0, 0),
        };
    }
    handleWindowResize(e) {
        const originalBoxSize = new Point(0, 0);
        originalBoxSize.x = document.getElementById(this.props.id).clientWidth;
        originalBoxSize.y = document.getElementById(this.props.id).clientHeight;
        this.setState({ originalBoxSize: originalBoxSize });
        console.log(originalBoxSize.x + "," + originalBoxSize.y)
    }
    componentDidMount() {
        document.getElementById(this.props.id).addEventListener('wheel', (e) => { e.preventDefault(); }, { passive: false });

        const originalBoxSize = new Point(0, 0);
        originalBoxSize.x = document.getElementById(this.props.id).clientWidth;
        originalBoxSize.y = document.getElementById(this.props.id).clientHeight;

        const area = 4 * this.vertexRadius * this.vertexRadius * 200.0;
        this.state.viewBoxScale = Math.sqrt(area / (originalBoxSize.x * originalBoxSize.y))
        this.setState({
            timerId: setInterval(this.updateVertexPos, 50),
            originalBoxSize: originalBoxSize
        });

        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        clearInterval(this.state.timerId);
        document.getElementById(this.props.id).removeEventListener('wheel', (e) => { e.preventDefault(); }, { passive: false });
        window.removeEventListener('resize', this.handleWindowResize);
    }
    updateVertexPos() {
        const coulomb = 10000.0, spring = 0.010, naturalLen = this.props.naturalLen, deltaT = 1;
        const vertexPoss = this.state.vertexPoss, edges = this.props.edges;
        let fs = Array(vertexPoss.length).fill(null);

        for (let i = 0; vertexPoss.length > i; i++) fs[i] = new Point(0, 0);
        for (let i = 0; vertexPoss.length > i; i++) {
            const v1 = vertexPoss[i];
            for (let j = 0; vertexPoss.length > j; j++) {
                if (i === j) continue;
                const v2 = vertexPoss[j], len = Math.sqrt(Math.pow(v1.pos.x - v2.pos.x, 2) + Math.pow(v1.pos.y - v2.pos.y, 2)),
                    f = coulomb / Math.max(100.0, len * len);
                fs[i].add(new Point(f * (v1.pos.x - v2.pos.x) / len, f * (v1.pos.y - v2.pos.y) / len));
            }
        }

        for (let i = 0; edges.length > i; i++) {
            const v1 = vertexPoss[edges[i].from], v2 = vertexPoss[edges[i].to],
                len = Math.sqrt(Math.pow(v1.pos.x - v2.pos.x, 2) + Math.pow(v1.pos.y - v2.pos.y, 2)),
                f = spring * (len - naturalLen);
            fs[edges[i].to].add(new Point(f * (v1.pos.x - v2.pos.x) / len, f * (v1.pos.y - v2.pos.y) / len));
            fs[edges[i].from].add(new Point(f * (v2.pos.x - v1.pos.x) / len, f * (v2.pos.y - v1.pos.y) / len));
        }

        for (let i = 0; vertexPoss.length > i; i++) {
            if (this.state.draggingVertex === i || this.props.vAppearence[i].fixed) {
                vertexPoss[i].velocity = new Point(0, 0);
                continue;
            }
            vertexPoss[i].velocity.add(new Point(deltaT * fs[i].x, deltaT * fs[i].y));
            vertexPoss[i].velocity.mul(0.8);
            vertexPoss[i].pos.add(new Point(deltaT * vertexPoss[i].velocity.x, deltaT * vertexPoss[i].velocity.y));
        }
        this.setState({
            vertexPoss: vertexPoss
        });
    }

    static setRandomVertexPos(nOfVertices, width, height) {
        const vertexPoss = [];
        for (let i = 0; nOfVertices > i; i++) {
            vertexPoss.push(new VertexPhysics(i, new Point(getRandomInt(0, width), getRandomInt(0, height))));
        }
        return vertexPoss;
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.nOfVertices == prevState.vertexPoss.length) return prevState;
        return { vertexPoss: Graph.setRandomVertexPos(nextProps.nOfVertices, prevState.originalBoxSize.x * prevState.viewBoxScale, prevState.originalBoxSize.y * prevState.viewBoxScale) };
    }
    handleWheel(e) {
        console.log(e.deltaY);
        let deltaW = Math.sign(e.deltaY) * 0.1, viewBoxPos = this.state.viewBoxPos;
        if (this.state.viewBoxScale + deltaW < 0.1) deltaW = 0;
        this.setState({
            viewBoxScale: this.state.viewBoxScale + deltaW,
            viewBoxPos: new Point(viewBoxPos.x - this.state.originalBoxSize.x * deltaW / 2, viewBoxPos.y - this.state.originalBoxSize.y * deltaW / 2)
        });
    }
    handleViewBoxDragStart(e) {
        if (e.buttons & 1) {
            this.setState({ draggingViewBox: true, dragBeforePos: new Point(e.pageX, e.pageY) });
        }
    }
    handleVertexDragStart(e, id) {
        if (e.buttons & 1) {
            e.stopPropagation();
            this.setState({ draggingVertex: id, dragBeforePos: new Point(e.pageX, e.pageY) });
        }
    }

    handleMouseMove(e) {
        if (this.state.draggingVertex !== null) {
            const nv = this.state.vertexPoss.slice();
            const diff = new Point(e.pageX - this.state.dragBeforePos.x, e.pageY - this.state.dragBeforePos.y);
            diff.mul(this.state.viewBoxScale);
            nv[this.state.draggingVertex].pos.add(diff);

            this.setState({ vertexPoss: nv, dragBeforePos: new Point(e.pageX, e.pageY) });
        }
        if (this.state.draggingViewBox) {
            const diff = new Point(e.pageX - this.state.dragBeforePos.x, e.pageY - this.state.dragBeforePos.y);
            const npos = this.state.viewBoxPos;
            diff.mul(this.state.viewBoxScale);
            npos.sub(diff);
            this.setState({ viewBoxPos: npos, dragBeforePos: new Point(e.pageX, e.pageY) });
        }
    }
    handleReleaseVertex(e) {
        this.setState({
            draggingViewBox: false,
            draggingVertex: null,
            dragBeforePos: null
        });
    }
    render() {
        const vApp = this.props.vAppearence;
        const viewBoxStr = this.state.viewBoxPos.x + ", " + this.state.viewBoxPos.y + ", " + this.state.originalBoxSize.x * this.state.viewBoxScale + ", " + this.state.originalBoxSize.y * this.state.viewBoxScale;
        return (
            <div style={{ width: this.props.width, height: this.props.height }}>

                <svg id={this.props.id} viewBox={viewBoxStr} width="100%" height="100%" onWheel={this.handleWheel} onMouseMove={this.handleMouseMove} onContextMenu={(e) => { e.preventDefault(); }} onMouseDown={this.handleViewBoxDragStart} onMouseUp={this.handleReleaseVertex} onMouseLeave={this.handleReleaseVertex}>
                    <defs>
                        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" />
                        </pattern>
                        <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
                            <rect width="200" height="200" fill="url(#smallGrid)" />
                            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="gray" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect x={this.state.viewBoxPos.x} y={this.state.viewBoxPos.y} width="100%" height="100%" fill="url(#grid)" />

                    {this.props.edges.map((ed) =>
                        <Edge key={ed.id} selected={ed.selected} from={this.state.vertexPoss[ed.from].pos} to={this.state.vertexPoss[ed.to].pos} />
                    )}
                    {this.state.vertexPoss.map((v) =>
                        <Vertex key={v.id} center={v.pos} r={this.vertexRadius} selected={vApp[v.id].selected} fixed={vApp[v.id].fixed} onMouseUp={(e) => this.props.onMouseUpOnVertex(e, v.id)} onMouseDown={(e) => this.handleVertexDragStart(e, v.id)} onDoubleClick={(e) => this.props.onDoubleClick(e, v.id)}>{vApp[v.id].text}</Vertex>
                    )}
                </svg>
            </div>
        );
    }
}

Graph.defaultProps = {
    naturalLen:200.0,
}

function uniq(array) {
    return [...new Set(array)];
}


class VertexCoverGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentN: 0,
            nOfVertices: 0,
            vAppearence: [],
            edges: [],
            openDialog: false,
            openPanel: null,
            OPT: null,
            submissions: null,
            ranking: null,
            openResultDialog: false,
            waitingSubmit: false,
            lastSubmitResult: null,
            height: 0,
            naturalLen:200.0,
        }
        this.handleVertexClick = this.handleVertexClick.bind(this);
        this.submitAnswer = this.submitAnswer.bind(this);
        this.handleVertexDoubleClick = this.handleVertexDoubleClick.bind(this);
        this.getHeight = this.getHeight.bind(this);
    }
    togglePanel(panel) {
        if (this.state.openPanel === panel) this.setState({ openPanel: null });
        else this.setState({ openPanel: panel })
    }
    updateEdgeSelected() {
        const ed = this.state.edges, vApp = this.state.vAppearence;
        for (let i = 0; ed.length > i; i++) {
            ed[i].selected = (vApp[ed[i].from].selected || vApp[ed[i].to].selected);
        }
    }
    handleVertexClick(e, id) {
        if (e.button === 2) {
            const vertices = this.state.vAppearence;
            vertices[id].selected = !vertices[id].selected;
            this.updateEdgeSelected();
            this.setState({ vAppearence: vertices });
        }
    }
    handleVertexDoubleClick(e, id) {
        const vertices = this.state.vAppearence;
        vertices[id].fixed = !vertices[id].fixed;
        this.setState({ vAppearence: vertices });
    }
    setAllVertexFixed(f) {
        const vertices = this.state.vAppearence;
        vertices.map(v=>{v.fixed = f})
        this.setState({ vAppearence: vertices });
    }
    componentDidMount() {
        this.fetchProblem();
        if (!this.props.justView) {
            this.fetchSubmission();
            this.fetchRanking();

            let height = document.getElementById('graphviewBox').clientHeight
            window.addEventListener('resize', this.getHeight);
            this.getHeight();
        }
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.getHeight);
    }
    getHeight() {
        this.setState({ height: document.getElementById('graphviewBox').clientHeight });
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user != this.props.user) {
            this.fetchSubmission();
        }
        twttr.widgets.load(document.getElementsByClassName("MuiDialog-root"));
    }
    // setRandomGraph(){
    //     const edges = [], n = this.state.currentN, edNum = n * 1.5, vApp = [];
    //     for(let i = 0; n > i; i++){
    //         const cv = new VertexAppearence(i);
    //         cv.text = ""+i;
    //         vApp.push(cv);
    //     }
    //     for(let i = 0; edNum > i; i++){
    //         const from = getRandomInt(1,n);
    //         edges.push( new EdgeAppearence(i, from, getRandomInt(0,from)) );
    //     }
    //     this.setState({
    //         vAppearence: vApp,
    //         nOfVertices: this.state.currentN,
    //         edges : uniq(edges)
    //     });

    // }
    parseProblem(problem) {
        if (Object.keys(problem).length == 0) throw "Invalid JSON";
        const n = problem.problem.vertices.length, edges = [], vApp = [];
        for (let i = 0; n > i; i++) {
            const cv = new VertexAppearence(i);
            cv.text = "" + problem.problem.vertices[i].weight;
            cv.weight = problem.problem.vertices[i].weight;
            vApp.push(cv);
        }
        for (let i = 0; problem.problem.edges.length > i; i++) {
            edges.push(new EdgeAppearence(i, problem.problem.edges[i].from, problem.problem.edges[i].to));
        }
        this.setState({ vAppearence: vApp, nOfVertices: n, edges: edges, OPT: problem.OPT });
    }
    fetchProblem() {
        var cache = localStorage.getItem('problems/' + this.props.problemId);
        if (cache) {
            try {
                var obj = JSON.parse(cache);
                this.parseProblem(obj);
            }
            catch (e) {
                console.log(e);
                localStorage.removeItem('problems/' + this.props.problemId);
                this.fetchProblem();
            }
        }
        else {
            fetch("/api/problems/" + this.props.problemId + "/")
                .then(response => response.json())
                .then((json) => {
                    try {
                        this.parseProblem(json);
                        localStorage.setItem('problems/' + this.props.problemId, JSON.stringify(json));
                    }
                    catch (e) {
                        console.log(e);
                    }
                })
                .catch(function (err) {
                    console.error(err);
                })
        }
    }

    fetchRanking() {
        fetch("/api/submissions/?is_best=True&ordering=score,submitted_at&problemid="
            + this.props.problemId)
            .then(response => response.json())
            .then((json) => {
                for (let i = 0; json.results.length > i; i++)
                    json.results[i].rank = i + 1;
                this.setState({ ranking: json.results })
            })
            .catch(function (err) {
                console.error(err);
            })
    }

    fetchSubmission() {
        if (this.props.user === null) return;
        //console.log(this.props.user)

        fetch("/api/submissions/?ordering=-submitted_at&fields[]=solution&fields[]=submitted_at&fields[]=score&fields[]=user&fields[]=problem&fields[]=id&userid=" + this.props.user.id + "&problemid=" + this.props.problemId)
            .then(response => response.json())
            .then((json) => {
                console.log(json)
                this.setState({ submissions: json.results })
            })
            .catch(function (err) {
                console.error(err);
            })
    }

    submitAnswer() {
        if (this.props.user === null) {
            this.setState({ openDialog: true });
            return;
        }

        this.setState({ openResultDialog: true, waitingSubmit: true, lastSubmitResult: null });

        const selV = [];
        this.state.vAppearence.map((v) => { if (v.selected) selV.push(v.id) });
        const csrftoken = getCookie('csrftoken');
        fetch("/api/submit/", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ 'solution': selV, 'problem_id': this.props.problemId, 'user_id': 1 })
        })
            .then(response => response.json())
            .then((json) => {
                this.setState({ waitingSubmit: false, lastSubmitResult: json.score });
                this.fetchSubmission();
                this.fetchRanking();
                this.props.user.reload();
                console.log(json);
            });
        // .then( this.fetchTasks );

    }

    render() {

        const classes = this.props.classes;

        let score = 0, cleared = true, rest = 0;
        this.state.vAppearence.map((v) => { score += v.weight * v.selected; });
        this.state.edges.map((ed) => { cleared &= ed.selected; rest += !ed.selected; });


        return (
            <div id='graphviewBox' style={{ width: "100%", height: "100%" }}>
                {/* <div style={{height: "10%" }}>
                <label>
                    Num of vertices:
                    <input type="number" value={this.state.currentN} name="problemNumber" onChange={(e) => { this.setState({ currentN: e.target.value }) }} />
                </label>
                <button onClick={() => { this.fetchProblem(this.state.currentN) }}>Get Problem</button>
                </div>
                 */}
                <div style={{ width: "100%", height: "100%", borderRadius: "10px" }}>
                    <Graph vAppearence={this.state.vAppearence} onMouseUpOnVertex={this.handleVertexClick} onDoubleClick={this.handleVertexDoubleClick} id="graph0" nOfVertices={this.state.nOfVertices} edges={this.state.edges} naturalLen={this.state.naturalLen} width={"100%"} height={"100%"} />

                    {this.props.justView ||
                        <Box p="10px" style={{ pointerEvents: 'none', fontSize: "large", position: "absolute", bottom: "10%", right: "10%" }}>
                            
                            <HelpButton/>
                            <Box component={Paper} style={{ userSelect: "none", marginBottom: '10px', backgroundColor: 'rgba( 255, 255, 255, 0.55 )' }}>
                                <Box display="flex"  padding="0.5em">
                                    <Typography noWrap={true} style={{ userSelect: "none", overflow:"visible", paddingRight:"1em"}}>辺長</Typography>
                                    <Slider style={{ pointerEvents: 'auto'}} value={this.state.naturalLen} onChange={(e,nVal)=>this.setState({naturalLen:nVal})} min={10} max={1000} defaultValue={200} valueLabelDisplay="auto" getAriaValueText={()=>this.state.naturalLen}/>
                                </Box>

                                <Box display="flex" justifyContent="space-around" paddingBottom="8px">
                                    <Button variant="contained" color="primary" style={{ pointerEvents: 'auto'}} onClick={()=>this.setAllVertexFixed(true)}>全て固定</Button>
                                    <Button variant="contained" color="primary" style={{ pointerEvents: 'auto'}} onClick={()=>this.setAllVertexFixed(false)}>全て解放</Button>
                                </Box>
                            </Box>
                            <TableContainer component={Paper} style={{ userSelect: "none", marginBottom: '10px', backgroundColor: 'rgba( 255, 255, 255, 0.55 )' }}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                OPT
                                        </TableCell>
                                            <TableCell align="right">{this.state.OPT}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                コスト
                                        </TableCell>
                                            <TableCell align="right">{score}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                残り辺数
                                        </TableCell>
                                            <TableCell align="right">{rest}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button style={{ pointerEvents: cleared ? 'auto' : 'none', fontSize: "xx-large" }} size="large" variant="contained" color="primary" onClick={this.submitAnswer} disabled={!cleared}>
                                <DoneOutlineIcon fontSize="large" />SUBMIT
                            </Button>
                        </Box>
                    }
                </div>

                {this.props.justView ||
                    <div>
                        <Dialog open={this.state.openDialog} onClose={() => this.setState({ openDialog: false })}>
                            <MuiDialogTitle disableTypography>
                                <Typography variant="h6">ERROR</Typography>
                                <IconButton aria-label="close" style={{ position: 'absolute', right: '0px', top: '0px' }} onClick={() => this.setState({ openDialog: false })}>
                                    <CloseIcon />
                                </IconButton>
                            </MuiDialogTitle>
                            <DialogContent>
                                <DialogContentText>SUBMITするにはLOGIN済みである必要があります</DialogContentText>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={this.state.openResultDialog} onClose={() => { if (!this.state.waitingSubmit) this.setState({ openResultDialog: false }) }}>
                            {/* <MuiDialogTitle disableTypography>
                        <Typography variant="h6">ERROR</Typography>
                        <IconButton aria-label="close" style={{ position: 'absolute', right: '0px', top: '0px' }} onClick={() => this.setState({ openDialog: false })}>
                            <CloseIcon />
                        </IconButton>
                    </MuiDialogTitle> */}
                            <DialogContent>
                                {this.state.waitingSubmit ?
                                    <DialogContentText>{"Waiting for a response..."}</DialogContentText> :
                                    (this.state.lastSubmitResult > this.state.OPT ?
                                        <DialogContentText variant="h5">{"SCORE:" + this.state.lastSubmitResult}</DialogContentText> :
                                        <DialogContentText variant="h1">{"OPTIMAL"}</DialogContentText>
                                    )
                            }
                        </DialogContent>
                        {this.state.waitingSubmit ||
                            <DialogActions>

                                {this.state.lastSubmitResult > this.state.OPT ?
                                    <a style={{ display: (this.state.lastSubmitResult == this.state.OPT && !this.state.waitingSubmit ? 'visible' : 'none') }} target="_blank" href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button"
                                        data-text={"Problem" +this.props.problemId + "でスコア" + this.state.lastSubmitResult + "(OPT:" + this.state.OPT + ")を取りました！"} data-show-count="false">Tweet</a>
                                    :
                                    <a style={{ display: (this.state.lastSubmitResult == this.state.OPT && !this.state.waitingSubmit ? 'visible' : 'none') }} target="_blank" href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button"
                                        data-text={"Problem" + this.props.problemId + "で最適解を出しました！"} data-show-count="false">Tweet</a>
                                }
                            </DialogActions>
                        }
                    </Dialog>

                        <div style={{ pointerEvents: 'none',  position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', width: 'min-content', height: '100%' }}>

                            <ExpansionPanel
                                style={{
                                    pointerEvents: 'auto', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 0,
                                }}
                                expanded={this.state.openPanel === "panel1"}
                                onChange={() => this.togglePanel("panel1")}
                            >
                                <ExpansionPanelSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    <Typography>Ranking</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <TableContainer style={{ maxHeight: Math.floor(this.state.height * 0.3) + 'px', userSelect: "none" }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Rank</TableCell>
                                                    <TableCell align="right">User</TableCell>
                                                    <TableCell align="right">Score</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {this.state.ranking && this.state.ranking.map((row) => (
                                                    <TableRow key={row.id}>
                                                        <TableCell align="right">{row.rank}</TableCell>
                                                        <UserTableCell user={row.user} />
                                                        {/* <TableCell style={{ whiteSpace: 'nowrap' }} align="right">{row.submitted_at}</TableCell> */}
                                                        <TableCell align="right">{row.score}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>

                            <ExpansionPanel
                                style={{
                                    pointerEvents: 'auto', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 0,
                                }}
                                expanded={this.state.openPanel === "panel2"}
                                onChange={() => this.togglePanel("panel2")}
                            >
                                <ExpansionPanelSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    <Typography>Submissions</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <TableContainer style={{ maxHeight: Math.floor(this.state.height * 0.3) + 'px', userSelect: "none", }}>
                                        <Table stickyHeader >
                                            <TableBody>
                                                {this.state.submissions && this.state.submissions.map((row) => (
                                                    <TableRow hover style={{ cursor: 'pointer' }} onClick={() => {
                                                        const vertices = this.state.vAppearence;
                                                        for (let i = 0; vertices.length > i; i++) {
                                                            vertices[i].selected = false;
                                                        }
                                                        for (let i = 0; row.solution.length > i; i++) {
                                                            vertices[row.solution[i]].selected = true;
                                                        }
                                                        this.updateEdgeSelected();
                                                        this.setState({ vAppearence: vertices })
                                                    }} key={row.id}>
                                                        <TableCell style={{ whiteSpace: 'nowrap' }} align="right">{row.submitted_at}</TableCell>
                                                        <TableCell align="right">{row.problem.OPT == row.score ? "OPT!" : row.score + "/" + row.problem.OPT}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                        </div>


                    </div>

                }
            </div>

        );
    }
}

function HelpButton(props) {
    const [anchorEl, setAnchorEl] = useState(null);

    return (
        <Box>
            <Box style={{ margin: '8px' }}>
                <Button onClick={(e) => setAnchorEl(s => s ? null : e.currentTarget)} style={{ pointerEvents: 'auto', backgroundColor: "rgb(25, 118, 210,0.75)" }}>
                    <HelpIcon style={{ color: "#fff" }} />
                </Button>
            </Box>

            <Popper open={anchorEl !== null} anchorEl={anchorEl} placement={'left'} style={{ zIndex: 1200 }} >
                <Paper elevation={3} style={{ padding: '8px', }}>
                    <Rule />
                </Paper>
            </Popper>
        </Box>
    );

}

export default VertexCoverGame;