/*
  This is supposed to store all data related to a single plot, including
  rendering params, so that it can be constructed, reconstructed and changed 
  easily.
*/

import dataManager from "../dataManagement/dataManager";
import Gate from "../dataManagement/gate/gate";
import { generateColor } from "graph/utils/color";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import FCSServices from "services/FCSServices/FCSServices";
import PopulationModel from "graph/models/populationModel";
import ObserversFunctionality, {
  publishDecorator,
} from "graph/dataManagement/observersFunctionality";

const DEFAULT_COLOR = "#000";

export interface PlotModelState {
  id?: string;
  ranges: { [index: string]: [number, number] };
  axisPlotTypes: { [index: string]: string };
  populationModel: PopulationModel;
  xAxis: string;
  yAxis: string;
  positionInWorkspace: [number, number];
  plotWidth: number;
  plotHeight: number;
  plotScale: number;
  xPlotType: string;
  yPlotType: string;
  histogramAxis: "horizontal" | "vertical";
  label: string;
  dimensions: {
    w: number;
    h: number;
  };
  positions: {
    x: number;
    y: number;
  };
  parentPlotId: string;
}

export default class PlotModel extends ObserversFunctionality {
  static instaceCount: number = 1;

  readonly id: string;
  ranges: { [index: string]: [number, number] } = {};
  axisPlotTypes: { [index: string]: string } = {};
  populationModel: PopulationModel;
  xAxis: string = "";
  yAxis: string = "";
  yHistogram: boolean = false;
  xHistogram: boolean = false;
  positionInWorkspace: [number, number];
  plotWidth: number = 0;
  plotHeight: number = 0;
  plotScale: number = 2;
  xPlotType: string = "";
  yPlotType: string = "";
  histogramAxis: "horizontal" | "vertical" = "vertical";
  label: string = "";
  histogramOverlays: {
    color: string;
    plot: any;
    plotId: string;
    plotSource: string;
  }[] = [];
  histogramBarOverlays: {
    color: string;
    plot: any;
    plotId: string;
    plotSource: string;
  }[] = [];
  dimensions: {
    w: number;
    h: number;
  } = {
    w: 10,
    h: 12,
  };
  positions: {
    x: number;
    y: number;
  } = {
    x: -1,
    y: -1,
  };
  parentPlotId: string = "";
  private changed: boolean = false;

  constructor() {
    super();
    this.id = dataManager.createID();
  }

  setupPlot() {
    const axes = this.populationModel.getAxes();
    try {
      const fscssc = this.populationModel.getFSCandSSCAxis();
      if (this.xAxis === "" && this.yAxis === "") {
        this.xAxis = axes[fscssc.fsc];
        this.yAxis = axes[fscssc.ssc];
      }
    } catch {}

    if (this.xAxis === "") this.xAxis = axes[0];
    if (this.yAxis === "") this.yAxis = axes[1];

    this.xPlotType =
      this.xAxis.toLowerCase().includes("fsc") ||
      this.xAxis.toLowerCase().includes("ssc")
        ? "lin"
        : "bi";
    this.yPlotType =
      this.yAxis.toLowerCase().includes("fsc") ||
      this.yAxis.toLowerCase().includes("ssc")
        ? "lin"
        : "bi";

    this.updateGateObservers();
  }

  getOverlays() {
    return this.histogramOverlays.map((e: any) => {
      return {
        plot: dataManager.getPlot(e.plot),
        color: e.color,
      };
    });
  }

  export(): string {
    const state: any = this.getState();
    return JSON.stringify(state);
  }

  import(plotJSON: string) {
    const plot = JSON.parse(plotJSON);
    this.setState(plot);
  }

  getState(): PlotModelState {
    return {
      id: this.id,
      label: this.label,
      ranges: this.ranges,
      axisPlotTypes: this.axisPlotTypes,
      populationModel: this.populationModel,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      positionInWorkspace: this.positionInWorkspace,
      plotWidth: this.plotHeight,
      plotHeight: this.plotWidth,
      plotScale: this.plotScale,
      xPlotType: this.xPlotType,
      yPlotType: this.yPlotType,
      histogramAxis: this.histogramAxis,
      dimensions: this.dimensions,
      positions: this.positions,
      parentPlotId: this.parentPlotId,
    };
  }

  setState(state: PlotModelState) {
    if (state.label !== undefined) this.label = state.label;
    if (state.ranges !== undefined) this.ranges = state.ranges;
    if (state.populationModel !== undefined)
      this.populationModel = state.populationModel;
    if (state.xAxis !== undefined) this.xAxis = state.xAxis;
    if (state.yAxis !== undefined) this.yAxis = state.yAxis;
    if (state.positionInWorkspace !== undefined)
      this.positionInWorkspace = state.positionInWorkspace;
    if (state.plotWidth !== undefined) this.plotWidth = state.plotHeight;
    if (state.plotHeight !== undefined) this.plotHeight = state.plotHeight;
    if (state.plotScale !== undefined) this.plotScale = state.plotScale;
    if (state.xPlotType !== undefined) this.xPlotType = state.xPlotType;
    if (state.yPlotType !== undefined) this.yPlotType = state.yPlotType;
    if (state.histogramAxis !== undefined)
      this.histogramAxis = state.histogramAxis;
    if (state.dimensions !== undefined) this.dimensions = state.dimensions;
    if (state.positions !== undefined) this.positions = state.positions;
    if (state.axisPlotTypes) this.axisPlotTypes = state.axisPlotTypes;
  }

  update(state: any) {
    if (state.label !== undefined) this.label = state.label;

    dataManager.redrawPlotIds.push(this.id);
    if (this.parentPlotId) dataManager.redrawPlotIds.push(this.parentPlotId);
  }

  addOverlay(
    PopulationModel: PopulationModel,
    color?: string,
    plotId?: string,
    plotSource?: string
  ) {
    if (!color) color = generateColor();
    this.histogramOverlays.push({
      plot: COMMON_CONSTANTS.FILE === plotSource ? PopulationModel : {},
      color: color,
      plotId: plotId,
      plotSource: plotSource,
    });

    this.initiateAutoSave();
  }

  initiateAutoSave() {
    if (dataManager.letUpdateBeCalledForAutoSave)
      dataManager.workspaceUpdated();
  }

  addBarOverlay(
    PopulationModel: PopulationModel,
    color?: string,
    plotId?: string,
    plotSource?: string
  ) {
    if (!color) color = generateColor();
    this.histogramBarOverlays.push({
      plot: COMMON_CONSTANTS.FILE === plotSource ? PopulationModel : {},
      color: color,
      plotId: plotId,
      plotSource: plotSource,
    });

    this.initiateAutoSave();
  }

  removeBarOverlay(ploDataID: string) {
    this.histogramBarOverlays = this.histogramBarOverlays.filter(
      (x) => x.plotId !== ploDataID
    );

    this.initiateAutoSave();
  }

  removeAnyOverlay(ploDataID: string) {
    this.histogramBarOverlays = this.histogramBarOverlays.filter(
      (x) => x.plotId !== ploDataID
    );
    this.histogramOverlays = this.histogramOverlays.filter(
      (x) => x.plotId !== ploDataID
    );

    this.initiateAutoSave();
  }

  removeOverlay(PopulationModelID: string) {
    this.histogramOverlays = this.histogramOverlays.filter(
      (e) => e.plotId !== PopulationModelID
    );

    this.initiateAutoSave();
  }

  createSubpop(inverse: boolean = false) {
    const newPlotModel = new PlotModel();
    newPlotModel.setState(this.getState());
    newPlotModel.populationModel = this.populationModel.createSubpop(inverse);
    newPlotModel.parentPlotId = this.id;
    newPlotModel.updateGateObservers();
    newPlotModel.positions = {
      x: -1,
      y: -1,
    };
    newPlotModel.dimensions = {
      w: 10,
      h: 12,
    };
    newPlotModel.parentPlotId = this.id;
    dataManager.redrawPlotIds.push(this.id);
    return dataManager.addNewPlotToWorkspace(newPlotModel);
  }

  /* ALTER PLOT STATE */

  addGate(gate: Gate, forceGatedPoints: boolean = false) {
    this.populationModel.addGate(gate, forceGatedPoints);
    this.updateGateObservers();
  }

  removeGate(gate: Gate) {
    const gateQuery = this.gates.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length !== 1) {
      if (gateQuery.length < 1)
        throw Error("Gate with ID = " + gate.id + " was not found");
      if (gateQuery.length > 1) {
        throw Error("Multiple gates with ID = " + gate.id + " were found");
      }
    }
    this.gates = this.gates.filter((g) => g.gate.id !== gate.id);

    this.axisDataCache = null;
    this.updateGateObservers();
  }

  addPopulation(gate: Gate) {
    const gateQuery = this.population.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length > 0) {
      throw Error(
        "Adding the same gate with ID = " + gate.id + " twice to plot"
      );
    }
    this.population.push({
      gate: gate,
      inverseGating: false,
    });

    this.axisDataCache = null;
    this.updateGateObservers();
  }

  removePopulation(gate: Gate) {
    const gateQuery = this.population.filter((g) => g.gate.id === gate.id);
    if (gateQuery.length !== 1) {
      if (gateQuery.length < 1)
        throw Error("Gate with ID = " + gate.id + " was not found");
      if (gateQuery.length > 1) {
        throw Error("Multiple gates with ID = " + gate.id + " were found");
      }
    }
    this.population = this.population.filter((g) => g.gate.id !== gate.id);

    this.axisDataCache = null;
    this.updateGateObservers();
  }

  getGates(): Gate[] {
    return this.gates.map((e) => e.gate);
  }

  getGatesAndPopulation(): Gate[] {
    return [
      ...this.gates.map((e) => e.gate),
      ...this.population.map((e) => e.gate),
    ];
  }

  setWidthAndHeight(w: number, h: number) {
    this.changed =
      this.changed || this.plotWidth !== w || this.plotHeight !== h;
    this.plotWidth = w - 40;
    this.plotHeight = h - 30;
  }

  setXAxisPlotType(plotType: string) {
    this.changed = this.changed || this.xPlotType !== plotType;
    this.xPlotType = plotType;
  }

  setYAxisPlotType(plotType: string) {
    this.changed = this.changed || this.yPlotType !== plotType;
    this.yPlotType = plotType;
  }

  xAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.yAxis = this.xAxis;
    this.xHistogram = true;
    this.histogramAxis = "vertical";
  }

  yAxisToHistogram() {
    this.changed = this.changed || this.yAxis !== this.xAxis;
    this.xAxis = this.yAxis;
    this.yHistogram = true;
    this.histogramAxis = "horizontal";
  }

  setXAxis(xAxis: string) {
    this.changed = this.changed || xAxis !== this.xAxis;
    this.xAxis = xAxis;
    this.xPlotType = this.rangePlotType.get(xAxis);
  }

  setYAxis(yAxis: string) {
    this.changed = this.changed || yAxis !== this.yAxis;
    this.yAxis = yAxis;
    this.yPlotType = this.rangePlotType.get(yAxis);
  }

  disableHistogram(axis: "x" | "y") {
    if (axis === "x") this.xHistogram = false;
    else this.yHistogram = false;
  }

  /* PLOT STATE GETTERS */

  getPointColors() {
    const allData = this.getAxesData(false);
    const colors: string[] = [];
    const isPointInside = (gate: any, point: number[]): boolean => {
      const p = {
        x: point[gate.gate.xAxis],
        y: point[gate.gate.yAxis],
      };
      return gate.gate.isPointInside(p)
        ? !gate.inverseGating
        : gate.inverseGating;
    };
    const gateDFS = (
      point: number[],
      gate: any,
      currentDepth: number
    ): { depth: number; color: string | null } => {
      if (!isPointInside(gate, point)) {
        return { depth: 0, color: null };
      }
      let ans = { depth: currentDepth, color: gate.gate.color };
      for (const child of gate.gate.children) {
        const cAns = gateDFS(
          point,
          { gate: child, inverseGating: false },
          currentDepth + 1
        );
        if (cAns.color !== null && cAns.depth > ans.depth) {
          ans = cAns;
        }
      }
      return ans;
    };
    const default_color =
      this.population.length === 0
        ? DEFAULT_COLOR
        : this.population[0].gate.color;
    for (let i = 0; i < allData.length; i++) {
      let ans = { depth: 0, color: default_color };
      for (const gate of this.gates) {
        const cAns = gateDFS(allData[i], gate, 1);
        if (cAns.color !== null && cAns.depth > ans.depth) {
          ans = cAns;
        }
      }
      colors.push(ans.color);
    }
    return colors;
  }

  getXAxisName() {
    return this.xAxis;
  }

  getYAxisName() {
    return this.yAxis;
  }

  getXandYData(
    targetXAxis?: string,
    targetYAxis?: string
  ): { xAxis: number[]; yAxis: number[] } {
    const xAxisName = targetXAxis !== undefined ? targetXAxis : this.xAxis;
    const yAxisName = targetYAxis !== undefined ? targetYAxis : this.yAxis;
    let xAxis: number[] = [];
    let yAxis: number[] = [];
    this.getAxesData().forEach((e) => {
      xAxis.push(e[xAxisName]);
      yAxis.push(e[yAxisName]);
    });

    return { xAxis, yAxis };
  }

  getAxis(targetAxis: string): number[] {
    const data: number[] = [];
    this.getAxesData().forEach((e) => {
      data.push(e[targetAxis]);
    });
    return data;
  }

  getXandYRanges(
    targetXAxis?: string,
    targetYAxis?: string
  ): { x: [number, number]; y: [number, number] } {
    targetXAxis = targetXAxis === undefined ? this.xAxis : targetXAxis;
    targetYAxis = targetYAxis === undefined ? this.yAxis : targetYAxis;
    if (
      this.ranges.constructor.name !== "Map" ||
      !this.ranges.has(targetXAxis) ||
      !this.ranges.has(targetYAxis)
    ) {
      this.findAllRanges();
    }
    return {
      x: this.ranges.get(targetXAxis),
      y: this.ranges.get(targetYAxis),
    };
  }

  private STD_BIN_SIZE = 50;
  getBins(binCount?: number, targetAxis?: string) {
    binCount = binCount === undefined ? this.getBinCount() : binCount;
    const axisName =
      targetAxis === undefined
        ? this.histogramAxis === "vertical"
          ? this.xAxis
          : this.yAxis
        : targetAxis;
    let range = this.ranges.get(axisName);
    let axis = this.getAxis(axisName);
    if (
      (this.xAxis === axisName && this.xPlotType === "bi") ||
      (this.yAxis === axisName && this.yPlotType === "bi")
    ) {
      const fcsServices = new FCSServices();
      const linearRange = this.ranges.get(axisName);
      axis = fcsServices.logicleMarkTransformer(
        [...axis],
        linearRange[0],
        linearRange[1]
      );
      range = [0.5, 1];
    }
    const binCounts = Array(binCount).fill(0);
    const step = (range[1] - range[0]) / binCount;
    let mx = 0;
    for (let i = 0; i < axis.length; i++) {
      const index = Math.floor((axis[i] - range[0]) / step);
      binCounts[index]++;
      if (binCounts[index] > mx) mx = binCounts[index];
    }
    return { list: binCounts, max: mx };
  }

  private getBinCount() {
    return this.histogramAxis === "horizontal"
      ? this.plotWidth / this.STD_BIN_SIZE
      : this.plotHeight / this.STD_BIN_SIZE;
  }

  resetOriginalRanges() {
    if (
      !this?.file ||
      !this?.file?.remoteData ||
      !this.file?.plotTypes ||
      !this?.file?.remoteData?.paramsAnalysis
    ) {
      throw Error("No original range exists");
    }
    this.findAllRanges();
  }

  private axisDataCache: null | {
    data: any[];
    filterGating: boolean;
    filterPop: boolean;
  } = null;
  getAxesData(filterGating: boolean = true, filterPop: boolean = true): any[] {
    if (
      this.axisDataCache !== null &&
      this.axisDataCache.filterGating === filterGating &&
      this.axisDataCache.filterPop === filterPop
    )
      return this.axisDataCache.data;
    let dataAxes: any = {};
    let size;
    for (const axis of this.file.axes) {
      dataAxes[axis] = this.getAxisData(axis);
      if (size !== undefined && dataAxes[axis].length !== size) {
        throw Error("Axes of different size were found");
      } else if (size === undefined) size = dataAxes[axis].length;
    }
    let data = Array(size)
      .fill(0)
      .map((_, i) => {
        const obj: any = {};
        for (const axis of this.file.axes) {
          obj[axis] = dataAxes[axis][i];
        }
        return obj;
      });
    if (filterGating) {
      for (const gate of this.gates) {
        if (gate.displayOnlyPointsInGate) {
          const x = gate.gate.xAxis;
          const y = gate.gate.yAxis;
          data = data.filter((e: any) => {
            const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
            return gate.inverseGating ? !inside : inside;
          });
        }
      }
    }
    if (filterPop) {
      for (const gate of this.population) {
        const x = gate.gate.xAxis;
        const y = gate.gate.yAxis;
        data = data.filter((e: any) => {
          const inside = gate.gate.isPointInside({ x: e[x], y: e[y] });
          return gate.inverseGating ? !inside : inside;
        });
      }
    }
    //@ts-ignore
    this.axisDataCache = { data, filterGating, filterPop };
    return data;
  }

  private gateObservers: { observerID: string; targetGateID: string }[] = [];
  private popObservers: { observerID: string; targetGateID: string }[] = [];
  private updateGateObservers() {
    let gateIds = this.gates.map((obj) => obj.gate.id);
    let obsIds = this.gateObservers.map((obj) => obj.targetGateID);
    let toAdd = gateIds.filter((g) => !obsIds.includes(g));
    let toRemove = obsIds.filter((g) => !gateIds.includes(g));

    toAdd.forEach((e) => {
      const obsID = dataManager.getGate(e).addObserver("update", () => {});
      this.gateObservers.push({ observerID: obsID, targetGateID: e });
    });
    toRemove.forEach((e) => {
      dataManager
        .getGate(e)
        .removeObserver(
          "update",
          this.gateObservers.filter((g) => g.targetGateID === e)[0].observerID
        );
      this.gateObservers = this.gateObservers.filter(
        (g) => g.targetGateID !== e
      );
    });
    gateIds = this.population.map((obj) => obj.gate.id);
    obsIds = this.popObservers.map((obj) => obj.targetGateID);
    toAdd = gateIds.filter((g) => !obsIds.includes(g));
    toRemove = obsIds.filter((g) => !gateIds.includes(g));
    toAdd.forEach((e) => {
      const obsID = dataManager.getGate(e).addObserver("update", () => {
        this.axisDataCache = null;
      });
      this.popObservers.push({ observerID: obsID, targetGateID: e });
    });
    toRemove.forEach((e) => {
      dataManager
        .getGate(e)
        .removeObserver(
          "update",
          this.popObservers.filter((g) => g.targetGateID === e)[0].observerID
        );
      this.popObservers = this.popObservers.filter((g) => g.targetGateID !== e);
    });
  }

  findRangeBoundries(axisData: number[]): [number, number] {
    let min = axisData[0],
      max = axisData[0];
    for (const p of axisData) {
      min = Math.min(p, min);
      max = Math.max(p, max);
    }
    return [min, max];
  }
}
