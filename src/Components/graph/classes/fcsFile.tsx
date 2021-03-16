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

  getPopulationFromGate(gate: Gate, inverse: boolean = false) {
    const xAxis = this.getAxisIndex(gate.xAxis);
    const yAxis = this.getAxisIndex(gate.yAxis);
    const newPopulation: Array<Array<number>> = [];
    this.data.map((p) => {
      if (gate.isPointInside([p[xAxis], p[yAxis]])) {
        if (!inverse) newPopulation.push(p);
      } else if (inverse) {
        newPopulation.push(p);
      }
    });
    return newPopulation;
  }

  private getAxisIndex(axisName: string): number {
    for (let i = 0; i < this.axes.length; i++) {
      if (this.axes[i] == axisName) return i;
    }
    throw Error("Axis " + axisName.toString() + " not found");
  }
}
