import Gate from "./gate/gate";

export interface FCSFileInput {
  name: string;
  axes: string[];
  data: Array<Array<number>>;
  gates?: Gate[];
  label?: string;
  plotTypes?: string[];
  pointColors?: string[];
}

export default class FCSFile {
  name: string = "";
  axes: string[] = [];
  data: Array<Array<number>> = [];
  gates?: Gate[] = [];
  label?: string = "";
  plotTypes?: string[] = [];
  pointColors?: string[] = [];

  constructor(file: FCSFileInput) {
    this.name = file.name;
    this.axes = file.axes;
    this.data = file.data;
    if (file.gates !== undefined) {
      this.gates = file.gates;
    }
    if (file.label !== undefined) {
      this.label = file.label;
    }

    this.plotTypes =
      file.plotTypes === undefined
        ? Array(this.data.length).fill("lin")
        : file.plotTypes;

    this.pointColors =
      file.pointColors === undefined
        ? Array(this.data.length).fill("#000")
        : file.pointColors;
  }

  getAxisPoints(axisName: string): number[] {
    const axisIndex = this.getAxisIndex(axisName);
    return this.data.map((e) => e[axisIndex]);
  }

  getPointColors() {
    return this.pointColors;
  }

  setAxisPlottingType(axisName: string, type: string) {
    this.plotTypes[this.getAxisIndex(axisName)] = type;
  }

  getAxisPlottingType(axisName: string): string {
    return this.plotTypes[this.getAxisIndex(axisName)];
  }

  getAxes() {
    return this.axes;
  }

  registerGate(gate: Gate) {
    this.gates.push(gate);
  }

  getGates(): Gate[] {
    return this.gates;
  }

  colorPoints(gate: Gate, color: string) {
    const xAxis = this.getAxisIndex(gate.xAxis);
    const yAxis = this.getAxisIndex(gate.yAxis);
    this.data.map((p, i) => {
      if (gate.isPointInside([p[xAxis], p[yAxis]])) {
        this.pointColors[i] = color;
      }
    });
  }

  getPopulationFromGates(gatingParams: { gate: Gate; inverse: boolean }[]) {
    const newPopulation: Array<Array<number>> = [];
    this.data.map((p, i) => {
      let belongsToAllGates = true;
      for (const { gate, inverse } of gatingParams) {
        if (
          gate.isPointInside({
            x: this.data[i][this.getAxisIndex(gate.xAxis)],
            y: this.data[i][this.getAxisIndex(gate.yAxis)],
          })
        ) {
          if (inverse) {
            belongsToAllGates = false;
          }
        } else if (!inverse) belongsToAllGates = false;
        if (belongsToAllGates === false) break;
      }
      if (belongsToAllGates) {
        newPopulation.push(p);
      }
    });
    return newPopulation;
  }

  duplicateWithSubpop(gates: Gate[], inverse: boolean = false) {
    const pop = this.getPopulationFromGates(
      gates.map((e) => {
        return { gate: e, inverse: inverse };
      })
    );
    return new FCSFile({
      name: `${this.name}'s ${gates.map((e) => e.name).join(" ")} subpop`,
      axes: this.axes,
      data: pop,
      gates: gates,
      label: this.label,
      plotTypes: this.plotTypes,
    });
  }

  axisIndexCache: any = new Map();
  private getAxisIndex(axisName: string): number {
    if (this.axisIndexCache.has(axisName)) {
      return this.axisIndexCache.get(axisName);
    }
    for (let i = 0; i < this.axes.length; i++) {
      if (this.axes[i] == axisName) {
        this.axisIndexCache.set(axisName, i);
        return i;
      }
    }
    throw Error("Axis " + axisName.toString() + " not found");
  }
}
