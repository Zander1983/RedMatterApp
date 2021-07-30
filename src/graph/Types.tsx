export type GateID = string;
export type FileID = string;
export type PlotID = string;
export type WorkspaceID = string;

export interface Point {
  x: number;
  y: number;
}

export interface Context2D {
  xAxis: string;
  yAxis: string;
  xAxisType: "lin" | "bi";
  yAxisType: "lin" | "bi";
}

export interface ContextualPoint extends Point {
  context: Context2D;
}

export interface Range {
  min: number;
  max: number;
  axis: string;
  axisType: "lin" | "bi";
}

export interface Vector extends ContextualPoint {}

export interface GateType {
  readonly id: GateID;
  color: string;
  name: string;
}

export interface PolygonGateType extends GateType {
  points: ContextualPoint[];
}

export interface OvalGateType extends GateType {
  center: ContextualPoint;
  primaryP1: ContextualPoint;
  primaryP2: ContextualPoint;
  secondaryP1: ContextualPoint;
  secondaryP2: ContextualPoint;
  ang: number;
}

export interface FileType {
  readonly id: FileID;
  events: Point[][];
  name: string;
  src: string;
  axes: string[];
  label?: string;
  plotTypes?: string[];
  context: Context2D;
}

export interface PlotType {
  readonly id: PlotID;
  fileId: FileID;
  gates: {
    gateId: GateID;
    displayOnlyPointsInGate: boolean;
    inverseGating: boolean;
  }[];
  population: {
    gateId: GateID;
    inverseGating: boolean;
  }[];
  ranges: { [index: string]: Range };
  context2D: Context2D;
  positionInWorkspace: [number, number];
  plotWidth: number;
  plotHeight: number;
  plotScale: number;
  label: string;
  dimensions: {
    w: number;
    h: number;
  };
  positions: {
    x: number;
    y: number;
  };
}

export interface HistogramPlotType extends PlotType {
  histogramAxis: "horizontal" | "vertical";
}

export interface ScatterPlotType extends PlotType {}

export interface WorkspaceType {
  readonly id: WorkspaceID;
  remoteID: string;
  gates: { [index: string]: GateType };
  files: { [index: string]: FileType };
  plots: { [index: string]: PlotType };
  previousStates: WorkspaceType[];
  mouseGateState: null;
}
