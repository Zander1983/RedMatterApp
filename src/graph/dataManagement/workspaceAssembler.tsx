// This guy can export and import a workspace. There are many rules on how to
// do this just right and this guy IS the de-facto responsible for that.
// By the way: only workspace has access to this guy too.

import staticFileReader from "graph/components/modals/staticFCSFiles/staticFileReader";
import Gate from "./gate/gate";
import OvalGate from "./gate/ovalGate";
import PolygonGate from "./gate/polygonGate";
import PlotData from "./plotData";
import WorkspaceData from "./workspaceData";
import lodash from "lodash";

export default class WorkspaceAssembler {
  exportWorkspace(workspace: WorkspaceData): string {
    const files: string[] = [];
    workspace.files.forEach((e) => {
      files.push(e.src + "://" + e.name);
    });
    const gates: Gate[] = [];
    workspace.gates.forEach((e) => {
      e = lodash.cloneDeep(e);
      e.parents = e.parents.map((p: any) => p.id);
      e.children = e.children.map((c: any) => c.id);
      const gateObj = JSON.parse(JSON.stringify(e));
      delete gateObj.observers;
      gates.push(gateObj);
    });
    const plots: object[] = [];
    workspace.plots.forEach((plot: any) => {
      plot = lodash.cloneDeep(plot);
      plot.gates = plot.gates.map((e: any) => {
        e.gate = e.gate.id;
        return e;
      });
      plot.population = plot.population.map((e: any) => {
        e.gate = e.gate.id;
        return e;
      });

      delete plot.axisDataCache;
      delete plot.randomSelection;
      delete plot.changed;
      delete plot.gateObservers;
      delete plot.popObservers;
      delete plot.observers;
      delete plot.STD_BIN_SIZE;
      plot.file = plot.file.src + "://" + plot.file.name;

      const p = JSON.parse(JSON.stringify(plot));

      const ranges: any = {};
      plot.ranges.forEach((v: [number, number], k: string) => {
        ranges[k] = v;
      });
      p.ranges = ranges;

      plots.push(p);
    });
    const name =
      workspace.workspaceName === undefined ? "" : workspace.workspaceName;
    return JSON.stringify({
      name,
      files,
      gates,
      plots: plots === null || plots === undefined ? [] : plots,
    });
  }

  importWorkspace(workspaceJSON: string, targetWorkspace: WorkspaceData) {
    const inp = JSON.parse(workspaceJSON);
    const files = new Map();
    const gates = new Map();
    const plots = new Map();
    const fileMappings: any = {};
    const gateMappings: any = {};
    const inverseGateMappings: any = {};

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

    let i = 0;
    for (const gateObj of inp.gates) {
      let gate: Gate;
      if (gateObj.gateType === "PolygonGate") {
        gate = new PolygonGate(gateObj);
      }
      if (gateObj.gateType === "OvalGate") {
        gate = new OvalGate(gateObj);
      }
      gate.children = [];
      gate.parents = [];
      if (gate === null) {
        throw Error('Could not recover gate "' + JSON.stringify(gateObj) + '"');
      }
      gates.set(gate.id, gate);
      gateMappings[gateObj.id] = gate.id;
      inverseGateMappings[gate.id] = i++;
    }

    gates.forEach((v: any, k: any) => {
      const origin = inp.gates[inverseGateMappings[v.id]];
      v.children = origin.children.map((e: any) => gates.get(gateMappings[e]));
      v.parents = origin.parents.map((e: any) => gates.get(gateMappings[e]));
    });

    for (let i = 0; i < inp.plots.length; i++) {
      const plotObj = inp.plots[i];

      plotObj.file = files.get(fileMappings[plotObj.file]);

      plotObj.gates = plotObj.gates.map((e: any) => {
        e.gate = gates.get(gateMappings[e.gate]);
        return e;
      });

      plotObj.population = plotObj.population.map((e: any) => {
        e.gate = gates.get(gateMappings[e.gate]);
        return e;
      });

      const ranges = new Map();
      for (const key in plotObj.ranges) {
        ranges.set(key, plotObj.ranges[key]);
      }
      plotObj.ranges = ranges;

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
