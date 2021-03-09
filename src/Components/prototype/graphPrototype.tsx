import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import data from './fcsFileData'
import { type } from 'node:os';


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
  console.log(typeof(data))
  return (
    <div className={classes.header}>]
        {/* <p>{ JSON.stringify(data['dimesions']) }</p> */}
    </div>
  );
}

export default GraphPrototype;
