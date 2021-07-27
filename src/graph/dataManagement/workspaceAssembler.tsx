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
import lodash from "lodash";
import dataManager from "./dataManager";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";

export default class WorkspaceAssembler {
  exportWorkspace(workspace: WorkspaceData): string {
    const files: string[] = [];
    workspace.files.forEach((e) => {
      files.push(e.src + "://" + e.id);
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
      let nplot = lodash.cloneDeep(plot);
      nplot.histogramBarOverlays.forEach((x: any) => {
        if (x.plot && Object.keys(x.plot).length > 0)
          x.plot = this.parsePlot(x.plot);
      });
      nplot.histogramOverlays.forEach((x: any) => {
        if (x.plot && Object.keys(x.plot).length > 0)
          x.plot = this.parsePlot(x.plot);
      });
      let p = this.parsePlot(nplot);
      plots.push(p);
    });
    const name =
      workspace.workspaceName === undefined ? "" : workspace.workspaceName;

    const workspaceJSON = JSON.stringify({
      name,
      files,
      gates,
      plots: plots === null || plots === undefined ? [] : plots,
    });
    return workspaceJSON;
  }
  parsePlot(plot: any) {
    plot = lodash.cloneDeep(plot);
    plot.gates = plot.gates.map((e: any) => {
      e.gate = e.gate.id;
      return e;
    });
    plot.population = plot.population.map((e: any) => {
      e.gate = e.gate.id;
      return e;
    });

    delete plot.ranges;
    delete plot.axisDataCache;
    delete plot.randomSelection;
    delete plot.changed;
    delete plot.gateObservers;
    delete plot.popObservers;
    delete plot.observers;
    delete plot.STD_BIN_SIZE;
    plot.file = plot.file.src + "://" + plot.file.id;
    const p = JSON.parse(JSON.stringify(plot));
    return p;
  }

  getHistogramOverlayObj(
    plotHistObj: any,
    files: Map<any, any>,
    fileMappings: any,
    oldNewPlotIdMap: any,
    plotObj: any
  ) {
    let newPlot;
    switch (plotHistObj.plotSource) {
      case COMMON_CONSTANTS.FILE:
        let plot = new PlotData();
        if (fileMappings[plotHistObj.plot.file]) return null;
        plot.file = files.get(fileMappings[plotHistObj.plot.file]);
        plot.setupPlot();
        plot.getXandYRanges();
        newPlot = {
          color: plotHistObj.color,
          plot: plot,
          plotId: plot.id,
          plotSource: plotHistObj.plotSource,
        };
        break;
      case COMMON_CONSTANTS.PLOT:
        if (oldNewPlotIdMap[plotHistObj.plotId]) return null;
        plotHistObj.plotId = oldNewPlotIdMap[plotHistObj.plotId];
        newPlot = plotHistObj;
        break;
    }
    return newPlot;
  }

  importWorkspace(workspaceJSON: string, targetWorkspace: WorkspaceData) {
    const inp = JSON.parse(workspaceJSON);
    const files = new Map();
    const gates = new Map();
    const plots = new Map();
    const fileMappings: any = {};
    const gateMappings: any = {};
    const inverseGateMappings: any = {};
    dataManager.letUpdateBeCalledForAutoSave = false;
    for (const fileString of inp.files) {
      const src = fileString.split("://");
      let file = dataManager.getFile(src[1]);
      if (src[0] === "local") {
        file = staticFileReader(src[1]);
      }
      if (file) {
        files.set(file.id, file);
        fileMappings[fileString] = file.id;
      }
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

    let oldNewPlotIdMap: any = {};

    for (let i = 0; i < inp.plots.length; i++) {
      const plotObj = inp.plots[i];
      if (!fileMappings[plotObj.file]) continue;
      plotObj.file = files.get(fileMappings[plotObj.file]);

      plotObj.gates = plotObj.gates.map((e: any) => {
        e.gate = gates.get(gateMappings[e.gate]);
        return e;
      });

      plotObj.population = plotObj.population.map((e: any) => {
        e.gate = gates.get(gateMappings[e.gate]);
        return e;
      });

      const plot = new PlotData();
      oldNewPlotIdMap[plotObj.id] = plot.id;
      plot.setState(plotObj);
      plot.getXandYRanges();
      plots.set(plot.id, plot);
    }

    for (let i = 0; i < inp.plots.length; i++) {
      const plotObj = inp.plots[i];
      for (let j = 0; j < plotObj.histogramOverlays.length; j++) {
        let plotHistObj = plotObj.histogramOverlays[j];
        let newPlotHistObj = this.getHistogramOverlayObj(
          plotHistObj,
          files,
          fileMappings,
          oldNewPlotIdMap,
          plotObj
        );
        if (newPlotHistObj) {
          let plot = plots.get(oldNewPlotIdMap[plotObj.id]);
          plot.addOverlay(
            newPlotHistObj.plot,
            newPlotHistObj.color,
            newPlotHistObj.plotId,
            newPlotHistObj.plotSource
          );
        }
      }
      for (let j = 0; j < plotObj.histogramBarOverlays.length; j++) {
        let plotHistObj = plotObj.histogramBarOverlays[j];
        let newPlotHistObj = this.getHistogramOverlayObj(
          plotHistObj,
          files,
          fileMappings,
          oldNewPlotIdMap,
          plotObj
        );
        if (newPlotHistObj) {
          let plot = plots.get(oldNewPlotIdMap[plotObj.id]);
          plot.addBarOverlay(
            newPlotHistObj.plot,
            newPlotHistObj.color,
            newPlotHistObj.plotId,
            newPlotHistObj.plotSource
          );
        }
      }
    }
    targetWorkspace.workspaceName = inp.workspaceName;
    targetWorkspace.files = files;
    targetWorkspace.gates = gates;
    targetWorkspace.plots = plots;

    targetWorkspace.setupWorkspace();
    dataManager.letUpdateBeCalledForAutoSave = true;
  }
}
