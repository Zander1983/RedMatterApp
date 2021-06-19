import React from "react";
import { Button } from "@material-ui/core";

import KeyboardBackspace from "@material-ui/icons/KeyboardBackspace";
import GetAppIcon from "@material-ui/icons/GetApp";

import PlotStats from "graph/dataManagement/stats";
import dataManager from "graph/dataManagement/dataManager";

import GateMenu from "./menus/GateMenu";
import FileMenu from "./menus/FileMenu";
import PlotMenu from "./menus/PlotMenu";

import { COMMON_SERVICE } from "services/commonService";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";

const classes = {
  table: {},
};

export default function SideMenus() {
  const ref = React.useRef(null);
  // == General modal logic ==

  const [fileMenuOpen, setFileMenuOpen] = React.useState(false);
  const [gateMenuOpen, setGateMenuOpen] = React.useState(false);
  const [plotMenuOpen, setPlotMenuOpen] = React.useState(false);
  const [downloadFileName, setDownloadFileName] = React.useState("");
  const [downloadFileUrl, setDownloadFileUrl] = React.useState("");
  const downloadFile = React.useRef(null);

  const downloadCsv = () => {
    let statsProvider = new PlotStats();

    let plots = dataManager.getAllPlots();
    debugger
    let statsArray = [];
    for (let i = 0; i < plots.length; i++) {
      let plot = plots[i].plot;
      let stats = statsProvider.getPlotStats(
        plot,
        COMMON_CONSTANTS.DROPDOWNS.STATS.Median,
        COMMON_CONSTANTS.DROPDOWNS.STATS.Median
      );
      const histogram = plot.xAxis === plot.yAxis ? true : false;
      let type = histogram ? "histogram" : "scatterplot";
      let furbishedStats = {
        type: type,
        Name: plots[i].plot.label,
        "From file": plot.file.name,
        population:
          plot.population.length === 0
            ? "All"
            : plot.population
                .reverse()
                .map(
                  (e: any) =>
                    `${e.inverseGating ? "not " : null} ${e.gate.name}`
                ),
        Brute: `${stats.gatedFilePopulationSize} / ${stats.filePopulationSize}`,
        Percentage: stats.gatedFilePopulationPercentage,
        MedianX: histogram ? `~` : stats.statY,
        MedianY: histogram ? `~` : stats.statY,
        "Points outside": stats.pointsOutSideOfRangeObj.count,
        "% of Points outside": stats.pointsOutSideOfRangeObj.percentage
      };
      statsArray.push(furbishedStats);
    }

    let output = COMMON_SERVICE.downloadCsvFile(statsArray, COMMON_CONSTANTS.SIDE_MENU.STATS);
    const blob = new Blob([output]);
    setDownloadFileName('stats.csv');
    setDownloadFileUrl(URL.createObjectURL(blob));
    downloadFile.current.click();

    // let gates = dataManager.getAllGates();
    // let files = dataManager.getAllFiles();
  };

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
        <div>
          {fileMenuOpen || plotMenuOpen || gateMenuOpen ? (
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
              Download all
            </Button>
          ) : null}
        </div>
      </div>
      <div
        style={{
          backgroundColor: "#fafafa",
          maxHeight: "calc(100vh - 500px)",
          overflowY: "auto",
        }}
      >
        {fileMenuOpen ? <FileMenu /> : null}
        {gateMenuOpen ? <GateMenu /> : null}
        {plotMenuOpen ? <PlotMenu /> : null}
      </div>
      <a
        style={{
          display: "none",
        }}
        download={downloadFileName}
        href={downloadFileUrl}
        ref={downloadFile}
      >
        download it
      </a>
    </div>
  );
}
