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
export type OverlaySource = "file" | "plot";
export type OverlayType = "line" | "bar";

export interface Dimension {
  w: number;
  h: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface HistogramOverlay {
  id: string;
  overlayType: OverlayType;
  population: PopulationID;
  color: Color;
  dataSource: OverlaySource;
  file?: FileID;
  plot?: PlotID;
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
  labels: string[];
  defaultRanges: {
    [index: string]: Range;
  };
  defaultAxisPlotTypes: {
    [index: string]: PlotType;
  };
  downloaded: boolean;
  downloading: boolean;
  view?: boolean;
}

export interface EventsRequestResponse {
  events: number[][];
  channels: {
    value: AxisName;
    label: string;
    display: PlotType;
    minimum: number;
    maximum: number;
  }[];
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
  parentPopulationId: PopulationID;
  gates: PopulationGateType[];
}
export interface Pipeline {
  isDefault: boolean;
  _id: string;
  experimentId: string;
  userId: string;
  name: string;
  organisationId: string;
  controlFileId: string;
}

export interface Workspace {
  id: WorkspaceID;
  notifications: Notification[];
  gates: Gate[];
  files: File[];
  pipelines: Pipeline[];
  plots: Plot[];
  populations: Population[];
  previousStates: Workspace[];
  workspaceState: {};
  sharedWorkspace: boolean;
  editWorkspace: boolean;
  selectedFile: string;
  activePipelineId: string;
  clearOpenFiles: boolean;
  updateType: string;
  fileIds: string[];
}

export interface PlotSpecificWorkspaceData {
  gates: Gate[];
  file: File;
  plot: Plot;
  population: Population;
  key: string; // react won't shut up about each prop list item having a key
}

export interface Notification {
  id: string;
  message: string;
}

export interface WorkspaceEvent {
  id: string;
  type: string;
  used: boolean;
}

export interface WorkspaceEventGateNaming extends WorkspaceEvent {
  type: "gateNaming";
  plotID: PlotID;
  gateID: GateID;
}

export interface PlotsRerender extends WorkspaceEvent {
  type: "plotsRerender";
  plotIDs: PlotID[];
}

export interface WorkspaceEventQueue {
  queue: WorkspaceEvent[];
}
