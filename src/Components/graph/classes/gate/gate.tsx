export interface GateInput {
  name?: string;
  color?: string;
  xAxis: string;
  yAxis: string;
}

export default abstract class Gate {
  name?: string = "";
  color?: string = "#5a5"; // Green
  xAxis: string = "";
  yAxis: string = "";

  constructor(gate: GateInput) {
    if (gate.name !== undefined) this.name = gate.name;
    if (gate.color !== undefined) this.color = gate.color;
    this.xAxis = gate.xAxis;
    this.yAxis = gate.yAxis;
  }

  abstract isPointInside(point: { x: number; y: number }): boolean;
}
