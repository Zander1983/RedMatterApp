import React from "react";
import { Button } from "@material-ui/core";

import KeyboardBackspace from "@material-ui/icons/KeyboardBackspace";
import GetAppIcon from "@material-ui/icons/GetApp";

// import PlotStats from "graph/util/stats";

import GateMenu from "./menus/GateMenu";
import FileMenu from "./menus/FileMenu";
import PlotMenu from "./menus/PlotMenu";

import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import { CSVCreator, CSVObject } from "services/CSVCreator";
import { getWorkspace } from "graph/utils/workspace";
import { Workspace } from "graph/resources/types";

export default function SideMenus(props: { workspace: Workspace }) {
  const ref = React.useRef(null);
  // == General modal logic ==

  const [fileMenuOpen, setFileMenuOpen] = React.useState(false);
  const [gateMenuOpen, setGateMenuOpen] = React.useState(false);
  const [plotMenuOpen, setPlotMenuOpen] = React.useState(false);
  const [statsX, setStatsX] = React.useState(
    COMMON_CONSTANTS.DROPDOWNS.STATS.Median
  );
  const [statsY, setStatsY] = React.useState(
    COMMON_CONSTANTS.DROPDOWNS.STATS.Median
  );

  // const downloadCsv = () => {
  //   let statsProvider = new PlotStats();
  //   let tableNames = ["Stats data", "Gates data", "Files data"];
  //   let csvCreator = new CSVCreator(tableNames);

  //   let tables = [];

  //   let table: CSVObject = {
  //     headers: [],
  //     body: [],
  //   };

  //   let plots = dataManager.getAllPlots();
  //   let statsArray = [];
  //   for (let i = 0; i < plots.length; i++) {
  //     let plot = plots[i].plot;
  //     let stats = statsProvider.getPlotStats(plot, statsX, statsY);
  //     const histogram = plot.xAxis === plot.yAxis ? true : false;
  //     let type = histogram ? "histogram" : "scatterplot";
  //     let furbishedStats = {
  //       type: type,
  //       Name: plots[i].plot.label,
  //       "From file": plot.file.name,
  //       population:
  //         plot.population.length === 0
  //           ? "All"
  //           : plot.population
  //               .reverse()
  //               .map(
  //                 (e: any) => `${e.inverseGating ? "not " : ""} ${e.gate.name}`
  //               )
  //               .reduce((prev, curr) => `${prev} & ${curr}`),
  //       Brute: `${stats.gatedFilePopulationSize} / ${stats.filePopulationSize}`,
  //       Percentage: stats.gatedFilePopulationPercentage,
  //       MedianX: histogram ? `~` : stats.statX,
  //       MedianY: histogram ? `~` : stats.statY,
  //       "Points outside": stats.pointsOutSideOfRangeObj.count,
  //       "% of Points outside": stats.pointsOutSideOfRangeObj.percentage,
  //     };
  //     statsArray.push(furbishedStats);
  //   }

  //   let statsHeader = COMMON_CONSTANTS.SIDE_MENU.STATS;
  //   let keys = Object.keys(COMMON_CONSTANTS.DROPDOWNS.STATS);
  //   statsHeader[6] = `${
  //     statsX === COMMON_CONSTANTS.DROPDOWNS.STATS.Median ? keys[0] : keys[1]
  //   } X`;
  //   statsHeader[7] = `${
  //     statsY === COMMON_CONSTANTS.DROPDOWNS.STATS.Median ? keys[0] : keys[1]
  //   } Y`;

  //   table.headers = statsHeader;
  //   table.body = statsArray;
  //   tables.push(JSON.parse(JSON.stringify(table)));

  //   let gates = dataManager.getAllGates();

  //   let plotsArray = [];
  //   for (let i = 0; i < gates.length; i++) {
  //     let gate = gates[i];
  //     let furbishedPlots = {
  //       Name: gate.gate.name,
  //       Color: gate.gate.color,
  //       Type: gate.gate.getGateType(),
  //       "X Axiz": gate.gate.xAxis,
  //       "Y Axis": gate.gate.yAxis,
  //     };
  //     plotsArray.push(furbishedPlots);
  //   }

  //   table.headers = COMMON_CONSTANTS.SIDE_MENU.GATE;
  //   table.body = plotsArray;
  //   tables.push(JSON.parse(JSON.stringify(table)));

  //   let files = dataManager.getAllFiles();
  //   let filesArray = [];
  //   for (let i = 0; i < files.length; i++) {
  //     let fileObj = files[i];
  //     let furbishedFiles = {
  //       Name: fileObj.file.name,
  //     };
  //     filesArray.push(furbishedFiles);
  //   }

  //   table.headers = ["Name"];
  //   table.body = filesArray;
  //   tables.push(JSON.parse(JSON.stringify(table)));

  //   csvCreator.exportToCSV(tables);
  // };

  const click = (target: string | undefined) => {
    let p = [
      { name: "files", var: fileMenuOpen, func: setFileMenuOpen },
      {
        name: "gates",
        var: gateMenuOpen,
        func: setGateMenuOpen,
      },
      {
        name: "plots",
        var: plotMenuOpen,
        func: setPlotMenuOpen,
      },
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
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        zIndex: 1000,
        padding: 10,
        backgroundColor: "#eef",
        borderRight: "solid 1px #ddd",
        borderTop: "solid 1px #ddd",
        borderTopRightRadius: 10,
      }}
    >
      <div
        style={{
          marginBottom: 10,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Button
            variant="contained"
            size="large"
            onClick={() => click("plots")}
            style={{
              backgroundColor: plotMenuOpen ? "#77d" : "#fff",
              color: plotMenuOpen ? "#fff" : "#000",
            }}
          >
            Stats & Plots
          </Button>
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
          <Button
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
          </Button>
          {fileMenuOpen || gateMenuOpen || plotMenuOpen ? (
            <Button
              style={{
                marginRight: 0,
                marginLeft: "auto",
              }}
              onClick={() => click(undefined)}
            >
              <KeyboardBackspace
                style={{
                  color: "black",
                }}
              ></KeyboardBackspace>
            </Button>
          ) : null}
        </div>
        {/* <div>
          <Button
            variant="contained"
            size="large"
            onClick={() => downloadCsv()}
            style={{
              marginLeft: 10,
              backgroundColor: "#fff",
              color: "#000",
            }}
          >
            <GetAppIcon
              fontSize="small"
              style={{
                marginRight: 10,
              }}
            ></GetAppIcon>
            Download .csv
          </Button>
        </div> */}
      </div>
      <div
        style={{
          backgroundColor: "#fafafa",
          maxHeight: "calc(100vh - 500px)",
          overflowY: "auto",
        }}
      >
        {fileMenuOpen ? <FileMenu files={props.workspace.files} /> : null}
        {gateMenuOpen ? <GateMenu gates={props.workspace.gates} /> : null}
        {plotMenuOpen ? (
          <PlotMenu
            plots={props.workspace.plots}
            onStatChange={(e) => {
              e["x"] ? setStatsX(e["value"]) : setStatsY(e["value"]);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
