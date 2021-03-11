import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ScatterPlotGraph from './graph/ScatterPlotGraph'
import { Button } from '@material-ui/core'
import Modal from '@material-ui/core/Modal'
import { Divider } from '@material-ui/core';

import AddFileModal from './components/AddFileModal'
import GenerateReportModal from './components/GenerateReportModal'

import fscFileData from './fcsFileData'
const data = fscFileData.data
const dimesions = fscFileData.dimensions


const useStyles = makeStyles((theme) => ({
  header: {
    textAlign: 'center',
  },
  title: {
  },
  fileSelectModal: {
    backgroundColor: '#efefef',
    boxShadow: theme.shadows[6],
    padding: 20,
    width: '800px',
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: '-400px',
    marginTop: '-150px',
    textAlign: 'center'
  },
  fileSelectFileContainer: {
    backgroundColor: '#efefef',
    padding: 10,
    borderRadius: 5
  },
  fileSelectDivider: {
    marginTop: 10,
    marginBottom: 10,
  },
  topButton: {
    marginLeft: 30
  }
}));

const scatterPlots: JSX.Element[] = []

function GraphPrototype() {
  const classes = useStyles();
  const dimData = data.map((p: Array<number>): [number, number] => { return [p[0], p[1]] })

  const [addFileModalOpen, setAddFileModalOpen] = React.useState(false);
  const [generateReportModalOpen, setGenerateReportModalOpen] = React.useState(false);

  const handleOpen = (func: Function) => { func(true) }
  const handleClose = (func: Function) => { func(false) }

  const addFile = (file: {
    title: string,
    information: string,
    data: Array<Array<number>>,
    lastModified: string
  }) => {
    const parsedData = file.data.map((e: Array<number>): [number, number] => [e[0], e[1]])
    scatterPlots.push(
      <ScatterPlotGraph
        key={scatterPlots.length}
        data={parsedData}
        xAxis={{ "key": 0, "value": "Comp-APC-A - CD45", "display": "bi" }}
        yAxis={{ "key": 1, "value": "Time", "display": "bi" }} />
    )
  }

  return (
    <div className={classes.header}>
      <AddFileModal
        addFile={addFile}
        open={addFileModalOpen}
        closeCall={{ f: handleClose, ref: setAddFileModalOpen }}/>

      <GenerateReportModal
        open={generateReportModalOpen}
        closeCall={{ f: handleClose, ref: setGenerateReportModalOpen }}/>

      <div style={{ color: '#555', backgroundColor: '#eee', paddingBottom: 1, paddingTop: 15, marginBottom: 30 }}>
        <p>
          This is a <b>PROTOTYPE</b> showing basic functionalities we expect to add to Red Matter.<br />
          You can help us improve or learn more by sending an email to <a href="mailto:redmatterapp@gmail.com"><b>redmatterapp@gmail.com</b></a>.
        </p>
      </div>

      <div style={{
        marginBottom: 50
      }}>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => handleOpen(setAddFileModalOpen)}
          className={classes.topButton}>
          + Add new file
        </Button>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => handleOpen(setGenerateReportModalOpen)}
          className={classes.topButton}>
          Generate report
        </Button>
      </div>

      {
        scatterPlots.map(e => e)
      }
    </div>
  );
}

export default GraphPrototype;
