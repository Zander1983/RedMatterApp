import React, { useEffect, useState } from "react";
import { File } from "../../resources/types";

import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import { makeStyles } from "@material-ui/core";
import whyDidYouUpdate from "hooks/useWhyDidYouUpdate";

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
    textAlign: "center",
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

interface Props {
  selectedFile: string;
  // arrowFunc: Function;
  onRowClick: Function;
  file: File;
  headers: string[];
  data: any[];
  openFiles: string[];
  setOpenFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

const PlotStateComponent = ({
  selectedFile,
  file,
  headers,
  data,
  openFiles,
  onRowClick,
}: Props) => {
  const classes = useStyles();
  // console.log(data, file.name);

  // useEffect(() => {
  //     console.log("=== Plot Row State: " + file.id);
  //     console.log(workspace.files);
  //     console.log(workspace.populations);
  // },[workspace]);
  // whyDidYouUpdate("PLOTSTATE", {
  //   selectedFile,
  //   file,
  //   headers,
  //   data,
  //   openFiles,
  //   onRowClick,
  // });

  return (
    <TableRow>
      {headers &&
        data !== undefined &&
        headers.length > 1 &&
        data.length > 0 &&
        data?.map((value: any, i: any) =>
          i === 0 ? (
            <TableCell
              className={`${classes.tableCell}`}
              key={"content-" + value + i}
            >
              {file?.name}
            </TableCell>
          ) : i !== data.length - 1 ? (
            <TableCell
              className={classes.tableCell}
              key={"content-" + value + i}
            >
              {value || "NA"}
            </TableCell>
          ) : (
            <TableCell
              className={`${classes.tableCell}`}
              key={"content-" + value + i}
              onClick={() => {
                onRowClick();
              }}
            >
              <button
                className={classes.view}
                style={{
                  cursor: file.id === selectedFile ? "default" : "pointer",
                  backgroundColor:
                    file.id === selectedFile ? "#FAFAFA" : "#333",
                  color: file.id === selectedFile ? "black" : "whilte",
                }}
                disabled={file.id === selectedFile}
              >
                {file.id === selectedFile
                  ? "Selected File"
                  : openFiles.includes(file.id)
                  ? "Close"
                  : "View Plots"}
              </button>
            </TableCell>
          )
        )}
    </TableRow>
  );
};

export default PlotStateComponent;
