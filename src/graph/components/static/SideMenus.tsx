import React from "react";
import { Button } from "@material-ui/core";

import KeyboardBackspace from "@material-ui/icons/KeyboardBackspace";

import GateMenu from "./menus/GateMenu";
import FileMenu from "./menus/FileMenu";
import PlotMenu from "./menus/PlotMenu";

const classes = {
  table: {},
};

export default function SideMenus() {
  const ref = React.useRef(null);
  // == General modal logic ==

  const [fileMenuOpen, setFileMenuOpen] = React.useState(false);
  const [gateMenuOpen, setGateMenuOpen] = React.useState(false);
  const [plotMenuOpen, setPlotMenuOpen] = React.useState(false);

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
    console.log("testing...");
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
          flex: 1,
          flexDirection: "row",
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => click("plots")}
          style={{
            backgroundColor: plotMenuOpen ? "#77d" : "#fff",
            color: plotMenuOpen ? "#fff" : "#000",
          }}
        >
          Plots
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
        {fileMenuOpen || gateMenuOpen ? (
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
    </div>
  );
}
