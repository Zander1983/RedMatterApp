import { makeStyles } from "@material-ui/core/styles";

import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
import deleteIcon from "assets/images/delete.png";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import useWhyDidYouUpdate from "hooks/useWhyDidYouUpdate";

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: "#FAFAFA",
    width: "100%",
    color: "#333",
    padding: 20,
  },
  tableCell: {
    width: "auto",
    color: "#333",
    border: "1px #333 solid",
    padding: "5px !important",
  },
  view: {
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: 500,
    padding: "2px 5px",
    background: "#333333",
    minWidth: 90,
    margin: "0px 8px",
    borderRadius: 5,
  },
  arrow: {
    height: 15,
    width: 10,
    marginLeft: 5,
    cursor: "pointer",
  },
  delete: {
    height: 15,
    width: 15,
    marginLeft: 10,
    cursor: "pointer",
  },
  itemOuterDiv: {
    flex: 1,
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
    paddingBottom: "2rem",
    minWidth: 370,
    backgroundColor: "rgb(238, 238, 255)",
  },
  itemInnerDiv: {
    width: "100%",
    height: "100%",
  },
  show: {
    opacity: 1,
    display: "block",
  },
  hide: {
    opacity: 0,
    display: "none",
    transition: "opacity 1s ease-out",
  },
  responsiveContainer: {
    marginTop: 3,
    marginBottom: 10,
  },
  loaderContainerStyle: {
    position: "relative",
    left: "45vw",
    height: 419,
  },
  loader: {
    width: 50,
    height: 50,
  },
}));

interface TableProps {
  sortByColumn: (colIndex: number, type: string) => void;
  deleteColumn: (index: number) => void;
}

const PlotHeadComponent = ({ sortByColumn, deleteColumn }: TableProps) => {
  const classes = useStyles();
  const [headers, setHeaders] = useState(["File Name", "Click to View"]);
  //@ts-ignore
  const gates = useSelector((state) => state.workspace.gates);
  //@ts-ignore
  const plotLength = useSelector((state) => state.workspace.plots.length);
  useEffect(() => {
    plotLength > 0
      ? setHeaders([
          "File Name",
          ...gates.map((gate: any) => gate.name),
          "Click to View",
        ])
      : setHeaders([]);
  }, [gates, plotLength]);
  // console.log("==Table Header==");

  return (
    <TableHead>
      <TableRow>
        {headers.map((values, index) => (
          <TableCell
            className={classes.tableCell}
            style={{ textAlign: "center" }}
            key={"top-" + index}>
            {values}
            {index !== 0 && index !== headers.length - 1 && (
              <>
                <img
                  onClick={() => {
                    sortByColumn(index, "asc");
                  }}
                  src={downArrow}
                  alt="down-arrow"
                  className={classes.arrow}
                />
                <img
                  onClick={() => {
                    sortByColumn(index, "dsc");
                  }}
                  src={upArrow}
                  alt="up-arrow"
                  className={classes.arrow}
                />
                <img
                  onClick={() => {
                    // setOpenFiles([getWorkspace().selectedFile]);
                    deleteColumn(index - 1);
                  }}
                  src={deleteIcon}
                  alt="delete-icon"
                  className={classes.delete}
                />
              </>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
export default PlotHeadComponent;
