export type WorkspaceID = string;
export type RemoteWorkspaceID = string;
export type GateID = string;
export type PopulationID = string;
export type FileID = string;
export type PlotID = string;

export type PlotType = "" | "lin" | "bi";
export type GateType = "" | "polygon" | "histogram" | "quadrant" | "oval";
export type AxisName = string;
export type Color = string;
export type SrcType = "remote" | "remote-sample";
export type Point = [number, number];
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

export interface Gate {
  id: GateID;
  gateType: GateType;
  points: Point[];
  name: string;
  color: Color;
  xAxis: AxisName;
  xAxisType: PlotType;
  xAxisOriginalRanges: Point;
  yAxis: AxisName;
  yAxisType: PlotType;
  yAxisOriginalRanges: Point;
  parents: [GateID, GateID];
}

export interface File {
  id: FileID;
  name: string;
  src: SrcType;
  axes: AxisName[];
  label: "file-label";
  plotTypes: PlotType[];
}

export interface Plot {
  id: PlotID;
  ranges: {
    [index: string]: Range;
  };
  axisPlotTypes: {
    [index: string]: PlotType;
  };
  gates: [
    {
      displayOnlyPointsInGate: true;
      inverseGating: false;
      gate: GateID;
    }
  ];
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
  gates: [
    {
      inverseGating: false;
      gate: GateID;
    }
  ];
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

export interface Workspace {
  id: WorkspaceID;
  gates: Gate[];
  files: File[];
  plots: Plot[];
  populations: Population[];
  previousStates: Workspace[];
  mouseGateState: GatingState;
}
