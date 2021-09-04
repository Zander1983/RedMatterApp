export type WorkspaceID = string;
export type RemoteWorkspaceID = string;
export type GateID = string;
export type PopulationID = string;
export type FileID = string;
export type PlotID = string;

export type PlotType = "" | "lin" | "bi";
export type GateType = "" | "polygon" | "histogram" | "oval";
export type AxisName = string;
export type Color = string;
export type SrcType = "remote" | "remote-sample";
export type Point = { x: number; y: number };
export type PointObj = { x: number; y: number };
export type HistogramAxisType = "" | "horizontal" | "vertical";
export type Range = [number, number];

export interface Dimension {
  w: number;
  h: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface HistogramOverlay {
  color: Color;
  plotId: PlotID;
  plotSource: string;
}

export interface PopulationGateType {
  inverseGating: false;
  gate: GateID;
}

export interface Gate {
  id: GateID;
  gateType: GateType;
  name: string;
  color: Color;
  parents: GateID[];
}

export interface Gate1D extends Gate {
  axis: AxisName;
  axisType: PlotType;
  axisOriginalRanges: Range;
}

export interface HistogramGate extends Gate1D {
  gateType: "histogram";
  // not defined yet
}

export interface Gate2D extends Gate {
  xAxis: AxisName;
  xAxisType: PlotType;
  xAxisOriginalRanges: Range;
  yAxis: AxisName;
  yAxisType: PlotType;
  yAxisOriginalRanges: Range;
}

export interface PolygonGate extends Gate2D {
  points: Point[];
  gateType: "polygon";
}

export interface OvalGate extends Gate2D {
  gateType: "oval";
  // not defined yet
}

export interface File {
  id: FileID;
  experimentId: string;
  createdOn: Date;
  fileSize: number;
  eventCount: number;
  name?: string;
  src?: SrcType;
  axes: AxisName[];
  label: string;
  plotTypes?: PlotType[];
  downloaded: boolean;
}

export interface EventsRequestResponse {
  events: number[][];
  channels: { key: number; value: AxisName; display: PlotType }[];
  $locals: {};
  $op: null;
  title: string;
  id: FileID;
}

export interface Plot {
  id: PlotID;
  ranges: {
    [index: string]: Range;
  };
  axisPlotTypes: {
    [index: string]: PlotType;
  };
  gates: GateID[];
  histogramOverlays: HistogramOverlay[];
  histogramBarOverlays: HistogramOverlay[];
  population: PopulationID;
  xAxis: AxisName;
  yAxis: AxisName;
  positionInWorkspace: [number, number];
  plotWidth: number;
  plotHeight: number;
  plotScale: number;
  xPlotType: PlotType;
  yPlotType: PlotType;
  histogramAxis: HistogramAxisType;
  label: string;
  dimensions: Dimension;
  positions: Point2D;
  parentPlotId: PlotID;
}

export interface Population {
  id: PopulationID;
  label: string;
  file: FileID;
  defaultRanges: {
    [index: string]: Range;
  };
  defaultAxisPlotTypes: {
    [index: string]: PlotType;
  };
  gates: PopulationGateType[];
}

export interface GatingState {
  active: GateType;
  targetPlot: PlotID;
  polygonGate: {
    xAxis: AxisName;
    yAxis: AxisName;
    isDraggingVertex: number;
    isDraggingGate: number;
    gatePivot: { x: number; y: number };
    points: { x: number; y: number };
    targetEditGate: null;
    targetPointIndex: null;
  };
  ovalGate: {
    center: { x: number; y: number };
    primaryP1: { x: number; y: number };
    primaryP2: { x: number; y: number };
    secondaryP1: { x: number; y: number };
    secondaryP2: { x: number; y: number };
    majorToMinorSize: number;
    lastMousePos: { x: number; y: number };
    ang: number;
    xAxis: AxisName;
    yAxis: AxisName;
  };
  histogramGate: {};
}

export interface DatasetMetadata {
  file: File;
  requestedAxes: AxisName[];
  requestedPlotTypes: PlotType[];
  requestedPop: PopulationGateType[];
}

export interface Workspace {
  id: WorkspaceID;
  gates: Gate[];
  files: File[];
  plots: Plot[];
  populations: Population[];
  previousStates: Workspace[];
  mouseGateState: GatingState;
}
