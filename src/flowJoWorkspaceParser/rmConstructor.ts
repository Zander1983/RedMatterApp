interface File {}
interface PolygonGate {}
interface Plot {}
export interface RMWorkspace_Interface {}
interface RMWorkspace_2_1_Interface extends RMWorkspace_Interface {}
interface RMWorkspace_2_2_Interface extends RMWorkspace_Interface {}

export class RMConstructor {
  files: File[];
  gates: PolygonGate[];
  plots: Plot[];

  constructor() {
    this.files = [];
    this.gates = [];
    this.plots = [];
  }

  addFile(file: File): any {}

  addGate(gate: PolygonGate): any {}

  addPlot(plot: Plot): any {}
}

class RM_2_1_Contructor extends RMConstructor {}

class RM_2_2_Contructor extends RMConstructor {}

export const getContructor = (version: string = "2.1"): RMConstructor => {
  if (version === "2.1") return new RM_2_1_Contructor();
  if (version === "2.2") return new RM_2_2_Contructor();
};
