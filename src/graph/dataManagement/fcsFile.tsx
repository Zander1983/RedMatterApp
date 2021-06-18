import Gate from "../dataManagement/gate/gate";
import dataManager from "./dataManager";

export interface FCSFileInput {
  name: string;
  src: string;
  axes: string[];
  data: Array<Array<number>>;
  label?: string;
  plotTypes?: string[];
  remoteData?: any;
}

export default class FCSFile {
  readonly id: string;
  name: string = "";
  src: string = "";
  axes: string[] = [];
  data: Array<Array<number>> = [];
  label?: string = "";
  plotTypes?: string[] = [];
  remoteData?: any = null;

  constructor(file: FCSFileInput) {
    this.id = dataManager.createID();

    this.src = file.src;

    this.name = file.name;
    this.axes = file.axes;
    this.data = file.data;

    if (file.remoteData !== undefined) this.remoteData = file.remoteData;

    if (file.label !== undefined) {
      this.label = file.label;
    }

    this.plotTypes =
      file.plotTypes === undefined
        ? Array(this.data.length).fill("lin")
        : file.plotTypes;
  }

  getAxisPoints(axisName: string): number[] {
    const axisIndex = this.getAxisIndex(axisName);
    return this.data.map((e) => e[axisIndex]);
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

  update(update: any) {
    if (update.name !== undefined) this.name = update.name;
  }

  getPopulationFromGates(gatingParams: { gate: Gate; inverse: boolean }[]) {
    const newPopulation: Array<Array<number>> = [];
    this.data.forEach((p, i) => {
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
      src: this.src,
      axes: this.axes,
      data: pop,
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
