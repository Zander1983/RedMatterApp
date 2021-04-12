import dataManager from "../dataManager";

export interface GateInput {
  name?: string;
  color?: string;
  xAxis: string;
  yAxis: string;
}

export interface Point {
  x: number;
  y: number;
}

const randomListOfColors = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"];

export default abstract class Gate {
  readonly id: string;
  name?: string;
  color?: string;
  xAxis: string;
  yAxis: string;
  parent: Gate | null = null;

  static instanceCount: number = 1;

  protected getGateType(): string {
    return "Abstract Gate";
  }

  constructor(gate: GateInput) {
    this.id = dataManager.createID();

    this.xAxis = gate.xAxis;
    this.yAxis = gate.yAxis;

    if (gate.name !== undefined) this.name = gate.name;
    else
      this.name = this.getGateType() + " " + (Gate.instanceCount++).toString();

    if (gate.color !== undefined) this.color = gate.color;
    else {
      this.color =
        randomListOfColors[
          (Gate.instanceCount - 2) % randomListOfColors.length
        ];
    }
  }

  isPointInside(point: { x: number; y: number }): boolean {
    if (this.parent !== null) {
      return this.parent.isPointInside(point);
    }
    return true;
  }
}
