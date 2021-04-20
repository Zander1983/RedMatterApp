// This guy can export and import a workspace. There are many rules on how to
// do this just right and this guy IS the de-facto responsible for that.
// By the way: only workspace has access to this guy too.

import { IdcardFilled } from "@ant-design/icons";
import staticFileReader from "graph/components/modals/staticFCSFiles/staticFileReader";
import Gate from "./gate/gate";
import OvalGate from "./gate/ovalGate";
import PolygonGate from "./gate/polygonGate";
import PlotData from "./plotData";
import WorkspaceData from "./workspaceData";

export default class WorkspaceAssembler {
  exportWorkspace(workspace: WorkspaceData): string {
    const files: string[] = [];
    workspace.files.forEach((e) => {
      files.push(e.src + "://" + e.name);
    });
    const gates: Gate[] = [];
    workspace.gates.forEach((e) => {
      const gateObj = JSON.parse(JSON.stringify(e));
      gateObj.observers = [];
      gates.push(gateObj);
    });
    const plots: object[] = [];
    workspace.plots.forEach((plot: any) => {
      // If you don't do this, you are going to alter live refs
      const p = JSON.parse(JSON.stringify(plot));
      p.observers = [];

      p.file = p.file.src + "://" + p.file.name;
      p.gates = p.gates.map((e: any) => {
        return {
          displayOnlyPointsInGate: e.displayOnlyPointsInGate,
          inverseGating: e.inverseGating,
          gate: e.gate.id,
        };
      });
      p.pointColors = [];
      plots.push(p);
    });
    const name =
      workspace.workspaceName === undefined ? "" : workspace.workspaceName;
    return JSON.stringify({
      name,
      files,
      gates,
      plots: plots === null || plots === undefined ? [] : plots,
    })
      .split(" ")
      .join("");
  }

  importWorkspace(workspaceJSON: string, targetWorkspace: WorkspaceData) {
    const inp = JSON.parse(workspaceJSON);
    const files = new Map();
    const gates = new Map();
    const plots = new Map();
    const fileMappings: any = {};
    const gateMappings: any = {};

    for (const fileString of inp.files) {
      const src = fileString.split("://");
      let file = null;
      if (src[0] === "local") {
        file = staticFileReader(src[1]);
      }
      if (file === null) {
        throw Error('Could not recover file "' + fileString + '"');
      }
      files.set(file.id, file);
      fileMappings[fileString] = file.id;
    }

    for (const gateObj of inp.gates) {
      let gate: Gate;
      if (gateObj.points !== undefined) {
        gate = new PolygonGate(gateObj);
      }
      if (gateObj.center !== undefined) {
        gate = new OvalGate(gateObj);
      }
      if (gate === null) {
        throw Error('Could not recover gate "' + JSON.stringify(gateObj) + '"');
      }
      gates.set(gate.id, gate);
      gateMappings[gateObj.id] = gate.id;
    }

    for (const plotObj of inp.plots) {
      plotObj.file = files.get(fileMappings[plotObj.file]);
      plotObj.gates = plotObj.gates.map((e: any) => {
        e.gate = gates.get(gateMappings[e.gate]);
        return e;
      });
      const plot = new PlotData();
      plot.setState(plotObj);
      plots.set(plot.id, plot);
    }

    targetWorkspace.workspaceName = inp.workspaceName;
    targetWorkspace.files = files;
    targetWorkspace.gates = gates;
    targetWorkspace.plots = plots;

    targetWorkspace.setupWorkspace();
  }
}
