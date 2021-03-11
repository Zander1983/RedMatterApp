import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { type } from 'node:os';
import ScatterPlotGraph from './graph/ScatterPlotGraph'

import fscFileData from './fcsFileData'
const data = fscFileData.data
const dimesions = fscFileData.dimensions

const useStyles = makeStyles((theme) => ({
  header: {
    textAlign: 'center',
    marginTop: 64
  },
  title: {
  }
}));

function GraphPrototype() {
  const classes = useStyles();
  const dimData = data.map((p: Array<number>): [number, number] => {return [ p[0], p[1] ]})
  return (
    <div className={classes.header}>
      <ScatterPlotGraph 
        data={dimData}
        xAxis={dimesions[0]}
        yAxis={dimesions[1]}/>
    </div>
  );
}

export default GraphPrototype;
