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
export type Dataset = { [index: string]: Float32Array };

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
  inverseGating: boolean;
  gate: GateID;
}

export interface Gate {
  id: GateID;
  gateType: GateType;
  name: string;
  color: Color;
  parents: GateID[];
  children: GateID[];
}

export interface Gate1D extends Gate {
  axis: AxisName;
  axisType: PlotType;
  axisOriginalRanges: Range;
  histogramDirection: HistogramAxisType;
}

export interface HistogramGate extends Gate1D {
  gateType: "histogram";
  points: [number, number];
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
  gatingActive: GateType;
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

export interface Workspace {
  id: WorkspaceID;
  gates: Gate[];
  files: File[];
  plots: Plot[];
  populations: Population[];
  previousStates: Workspace[];
}

export interface PlotSpecificWorkspaceData {
  gates: Gate[];
  file: File;
  plot: Plot;
  population: Population;
}
