import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import data from './fcsFileData'
import { type } from 'node:os';
import FlowCytometryGraph from './graph/FlowCytometryGraph'


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
  return (
    <div className={classes.header}>
        <FlowCytometryGraph/>
    </div>
  );
}

export default GraphPrototype;
