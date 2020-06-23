import React,{useState} from 'react';
import ReactDOM from 'react-dom';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import VertexCoverGame from'./graphview'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export function Rule(props) {
  const w = document.documentElement.clientWidth * 0.4;
  const h = document.documentElement.clientHeight * 0.6;

  return (
      <Box maxWidth={w} maxHeight={h} overflow="scroll">
      <Typography variant='h4'>最小重み頂点被覆問題</Typography>
      <Divider style={{margin:"8px 0px"}}/>
      <Typography>
        問題: グラフ G(V, E) と、頂点に対するコストc(v)が与えられる。 の各枝 e について端点のいずれか少なくとも一方が、V′ に含まれるような V の部分集合 V′ のうち、&Sigma;<sub>v&isin;V′</sub>c(v) が最小になるものを求めよ
      </Typography>
      <br/>
      <Typography variant='h4' marginTop="16px">操作方法</Typography>
      <Divider style={{margin:"8px 0px"}}/>
      {/* <VertexCoverGame justView={true} problemId={3} /> */}
      {/* <Typography>
        ・頂点を右クリック　その頂点をV′に追加（削除）
        ・頂点をドラッグ　頂点を移動できます
        ・頂点をダブルクリック　頂点の自動位置調整をオフにできます。（輪郭が赤くなります）
        </Typography> */}
      <Table>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">頂点を右クリック</TableCell>
            <TableCell align="left">その頂点をV′に追加、削除</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">頂点をドラッグ</TableCell>
            <TableCell align="left">頂点を移動できます</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">頂点をダブルクリック</TableCell>
            <TableCell align="left">頂点の自動移動をオフ、オンにできます（輪郭が赤くなります）</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">スクロール</TableCell>
            <TableCell align="left">ズームができます</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <br/>
      <Typography>任意の辺の一つ以上の端点が選択済みのとき、SUBMITすることで回答サーバーに記録できます。画面左上のYour submissionsを開き、過去の回答を選択することで復元が可能です。</Typography>
      <br/>
      <Typography variant='h4' marginTop="16px">パネルの見方</Typography>
      <Divider style={{margin:"8px 0px"}}/>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">辺長</TableCell>
            <TableCell align="left">辺の長さを変えられます</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">全て固定</TableCell>
            <TableCell align="left">頂点の自動移動をすべてオフにします</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">全て解放</TableCell>
            <TableCell align="left">頂点の自動移動をすべてオンにします</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">選択済み頂点/辺を無視</TableCell>
            <TableCell align="left">現在選択されている頂点と、すでに端点が選択済みの辺を自動位置調整の際に無視します</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">OPT</TableCell>
            <TableCell align="left">達成可能な最適値です</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">コスト</TableCell>
            <TableCell align="left">現在選択されている頂点のコストの和です</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">残り辺数</TableCell>
            <TableCell align="left">現在、端点のどちらも選択されていない辺の数です</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}