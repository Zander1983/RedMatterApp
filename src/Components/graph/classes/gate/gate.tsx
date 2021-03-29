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

  constructor(gate: GateInput) {
    this.xAxis = gate.xAxis;
    this.yAxis = gate.yAxis;

    if (gate.name !== undefined) this.name = gate.name;

    if (gate.color !== undefined) this.color = gate.color;
    else gate.color = "#f00";
  }

  setID(id: string) {
    this.id = id;
    if (this.name === undefined) this.name = "Gate " + id;
  }

  abstract isPointInside(point: { x: number; y: number }): boolean;
}
