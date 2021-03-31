export interface GateInput {
  name?: string;
  color?: string;
  xAxis: string;
  yAxis: string;
}

export default abstract class Gate {
  name?: string;
  color?: string;
  xAxis: string;
  yAxis: string;
  id: string;

  static instanceCount: number = 1;

  constructor(gate: GateInput) {
    this.xAxis = gate.xAxis;
    this.yAxis = gate.yAxis;

    if (gate.name !== undefined) this.name = gate.name;
    else this.name = "Gate " + (Gate.instanceCount++).toString();

    if (gate.color !== undefined) this.color = gate.color;
    else gate.color = "#f00";
  }

  setID(id: string) {
    this.id = id;
  }

  abstract isPointInside(point: { x: number; y: number }): boolean;
}
