import React, { useEffect } from "react";
import { CSVLink } from "react-csv";

import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardBackspace from "@material-ui/icons/KeyboardBackspace";
import GetAppIcon from "@material-ui/icons/GetApp";

import GateMenu from "./menus/GateMenu";
import FileMenu from "./menus/FileMenu";
import PlotMenu from "./menus/PlotMenu";

import PlotStats from "graph/utils/stats";
import { getFile, getGate } from "graph/utils/workspace";
import { Workspace, Gate } from "graph/resources/types";

import { COMMON_CONSTANTS } from "assets/constants/commonConstants";

const useStyles = makeStyles((theme) => ({
  sidebarContainer: {
    position: "fixed",
    left: 0,
    bottom: 0,
    zIndex: 1000,
    padding: 10,
    backgroundColor: "#eef",
    borderRight: "solid 1px #ddd",
    borderTop: "solid 1px #ddd",
    borderTopRightRadius: 10,
  },
  sidebarLayout: {
    marginBottom: 10,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  backBtn: {
    marginRight: 0,
    marginLeft: "auto",
  },
  downloadBtn: {
    marginLeft: 10,
    backgroundColor: "#fff",
    color: "#000",
  },
  downloadBtnLayout: {
    display: "flex",
    alignItems: "center",
    color: "#000",
  },
  dataValues: {
    backgroundColor: "#fafafa",
    maxHeight: "calc(100vh - 500px)",
    overflowY: "auto",
  },
}));

// const statsProvider = new PlotStats();

export default function SideMenus(props: { gates: Gate[] }) {
  const ref = React.useRef(null);
  const classes = useStyles();
  // useWhyDidYouUpdate("SideMenus", props);
  // == General modal logic ==

  // const [fileMenuOpen, setFileMenuOpen] = React.useState(false);
  const [gateMenuOpen, setGateMenuOpen] = React.useState(false);
  // const [plotMenuOpen, setPlotMenuOpen] = React.useState(false);
  // const [hierarchyOpen, setHierarchyOpen] = React.useState(false);
  // const [statsX, setStatsX] = React.useState(
  //   COMMON_CONSTANTS.DROPDOWNS.STATS.Median
  // );
  // const [statsY, setStatsY] = React.useState(
  //   COMMON_CONSTANTS.DROPDOWNS.STATS.Median
  // );

  // const headers = [
  //   { label: "Type", key: "type" },
  //   { label: "From file", key: "fromFile" },
  //   { label: "Population", key: "polulation" },
  //   { label: "X Axis", key: "xAxis" },
  //   { label: "Y Axis", key: "yAxis" },
  //   { label: "Sampled Event Count", key: "brute" },
  //   { label: "Percentage", key: "percentage" },
  //   { label: "Median X", key: "medianX" },
  //   { label: "Median Y", key: "medianY" },
  //   { label: "Mean X", key: "meanX" },
  //   { label: "Mean Y", key: "meanY" },
  //   { label: "Points outside", key: "pointsOutsideCount" },
  //   { label: "% of Points outside", key: "pointsOutsidePercentage" },
  // ];

  // const [data, setData] = React.useState<any[]>([]);

  // useEffect(() => {
  //   const timer = setTimeout(() => downloadCsv(), 100);
  //   return () => clearTimeout(timer);
  // }, [props.workspace.plots.length]);

  // const downloadCsv = () => {
  //   const { plots, populations } = props.workspace;
  //   const type: string[] = [];
  //   const fromFile: string[] = [];
  //   const polulation: string[] = [];
  //   const xaxis: string[] = [];
  //   const yaxis: string[] = [];
  //   const brute: string[] = [];
  //   const percentage: string[] = [];
  //   const medianX: string[] = [];
  //   const medianY: string[] = [];
  //   const meanX: string[] = [];
  //   const meanY: string[] = [];
  //   const pointsOutsideCount: string[] = [];
  //   const pointsOutsidePercentage: string[] = [];

  //   plots.map((plot) => {
  //     const stats = statsProvider.getPlotStats(plot, statsX, statsY);
  //     const median = statsProvider.getPlotStats(plot, 1, 1);
  //     const mean = statsProvider.getPlotStats(plot, 2, 2);

  //     type.push(plot.xAxis === plot.yAxis ? "histogram" : "scatterplot");

  //     xaxis.push(plot.xAxis);
  //     yaxis.push(plot.yAxis);
  //     brute.push(
  //       `${stats.gatedFilePopulationSize} / ${stats.filePopulationSize}`
  //     );
  //     percentage.push(stats.gatedFilePopulationPercentage);
  //     medianX.push(median.statX);
  //     medianY.push(median.statY);
  //     meanX.push(mean.statX);
  //     meanY.push(mean.statY);
  //     pointsOutsideCount.push(stats.pointsOutSideOfRangeObj.count.toString());
  //     pointsOutsidePercentage.push(
  //       stats.pointsOutSideOfRangeObj.percentage.toString()
  //     );
  //   });

  //   populations.map((item) => {
  //     fromFile.push(getFile(item.file).name);
  //     const popGate = item.gates[0];
  //     let gate: Gate;
  //     if (popGate) gate = getGate(popGate.gate);
  //     polulation.push(gate ? gate.name : "All");
  //   });
  //   let csvData: any[] = [];
  //   type.map((item, index) => {
  //     const element = {
  //       type: item,
  //       fromFile: fromFile[index],
  //       polulation: polulation[index],
  //       xAxis: xaxis[index],
  //       yAxis: yaxis[index],
  //       brute: brute[index],
  //       percentage: percentage[index],
  //       medianX: medianX[index],
  //       medianY: medianY[index],
  //       meanX: meanX[index],
  //       meanY: meanY[index],
  //       pointsOutsideCount: pointsOutsideCount[index],
  //       pointsOutsidePercentage: pointsOutsidePercentage[index],
  //     };
  //     csvData.push(element);
  //   });
  //   setData(csvData);
  // };

  const click = (target: string | undefined) => {
    let p = [
      // { name: "files", var: fileMenuOpen, func: setFileMenuOpen },
      {
        name: "gates",
        var: gateMenuOpen,
        func: setGateMenuOpen,
      },
      // {
      //   name: "plots",
      //   var: plotMenuOpen,
      //   func: setPlotMenuOpen,
      // },
      // {
      //   name: "hierarchy",
      //   var: hierarchyOpen,
      //   func: setHierarchyOpen,
      // },
    ];
    const r = p.filter((e) => e.name !== target);
    for (const e of r) {
      e.func(false);
    }
    if (target !== undefined) {
      const t = p.filter((e) => e.name === target)[0];
      t.func(!t.var);
    }
  };

  const handleClickOutside = (event: any) => {
    if (ref === null) return;
    const domNode = ref.current;
    if (!domNode || !domNode.contains(event.target)) {
      click(undefined);
    }
  };
  document.addEventListener("click", handleClickOutside, true);
  document.removeEventListener("click", handleClickOutside, true);

  return (
    <div ref={ref} className={classes.sidebarContainer}>
      <div className={classes.sidebarLayout}>
        <div>
          {/* Stats & Plots */}
          {/* <Button
            variant="contained"
            size="large"
            onClick={() => click("plots")}
            style={{
              backgroundColor: plotMenuOpen ? "#77d" : "#fff",
              color: plotMenuOpen ? "#fff" : "#000",
            }}
          >
            Stats & Plots
          </Button> */}

          {/* Gates */}
          <Button
            variant="contained"
            size="large"
            onClick={() => click("gates")}
            style={{
              marginLeft: 10,
              backgroundColor: gateMenuOpen ? "#77d" : "#fff",
              color: gateMenuOpen ? "#fff" : "#000",
            }}
          >
            Gates
          </Button>

          {/* Files */}
          {/* <Button
            variant="contained"
            size="large"
            onClick={() => click("files")}
            style={{
              backgroundColor: fileMenuOpen ? "#77d" : "#fff",
              color: fileMenuOpen ? "#fff" : "#000",
              marginLeft: 10,
            }}
          >
            Files
          </Button> */}

          {/* Files Hirarchy */}
          {/* <Button
            variant="contained"
            size="large"
            onClick={() => click("hierarchy")}
            style={{
              backgroundColor: hierarchyOpen ? "#77d" : "#fff",
              color: hierarchyOpen ? "#fff" : "#000",
              marginLeft: 10,
            }}
          >
            Gate Hirarchy
          </Button> */}

          {/* KeyboardBackspace */}
          {gateMenuOpen && (
            <Button
              className={classes.backBtn}
              onClick={() => click(undefined)}
            >
              <KeyboardBackspace style={{ color: "black" }}></KeyboardBackspace>
            </Button>
          )}
        </div>

        {/* CSV Download Button */}
        {/* <div>
          <Button
            variant="contained"
            size="large"
            // onClick={() => downloadCsv()}
            className={classes.downloadBtn}
          >
            
            <CSVLink
              headers={headers}
              data={data}
              filename="WorkspaceReport.csv"
              className={classes.downloadBtnLayout}
            >
              
              <GetAppIcon
                fontSize="small"
                style={{ marginRight: 10 }}
              ></GetAppIcon>
              Download .csv
            </CSVLink>
          </Button>
        </div> */}
      </div>

      {/* Values */}
      <div className={classes.dataValues}>
        {/* STATS & PLOTS */}
        {/* {plotMenuOpen && (
          <PlotMenu
            plots={props.workspace.plots}
            onStatChange={(e) => {
              e["x"] ? setStatsX(e["value"]) : setStatsY(e["value"]);
            }}
          />
        )} */}
        {/* GATES */}
        {gateMenuOpen && <GateMenu gates={props.gates} />}
        {/* FILES */}
        {/* {fileMenuOpen && <FileMenu files={props.workspace.files} />} */}
        {/* FILES HIERARCHY */}
        {/* {hierarchyOpen && <HierarchyMenu workspace={props.workspace} />} */}
      </div>
    </div>
  );
}
