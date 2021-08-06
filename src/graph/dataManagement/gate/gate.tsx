import dataManager from "../dataManager";
import ObserversFunctionality, {
  publishDecorator,
} from "../observersFunctionality";

export interface GateState {
  id?: string;
  name?: string;
  color?: string;
  xAxis: string;
  xAxisType: string;
  xAxisOriginalRanges?: [number, number];
  yAxis: string;
  yAxisType: string;
  yAxisOriginalRanges?: [number, number];
  parents: Gate[];
}

export interface Point {
  x: number;
  y: number;
}

const randomListOfColors = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"];

export default abstract class Gate extends ObserversFunctionality {
  readonly id: string;
  name?: string;
  color?: string | null;
  xAxis: string;
  xAxisType: string = "lin";
  xAxisOriginalRanges?: [number, number];
  yAxis: string;
  yAxisType: string = "lin";
  yAxisOriginalRanges?: [number, number];
  parents: Gate[] = [];
  children: Gate[] = [];

  static instanceCount: number = 1;

  getGateType(): string {
    return "Abstract Gate";
  }

  constructor(gate: GateState) {
    super();
    this.id = gate.id ? gate.id : dataManager.createID();

    this.setState(gate);
    Gate.instanceCount++;
  }

  setState(gate: GateState) {
    this.xAxis = gate.xAxis;
    this.yAxis = gate.yAxis;
    if (gate.xAxisType !== undefined) this.xAxisType = gate.xAxisType;
    if (gate.yAxisType !== undefined) this.yAxisType = gate.yAxisType;
    if (gate.xAxisOriginalRanges !== undefined)
      this.xAxisOriginalRanges = gate.xAxisOriginalRanges;
    if (gate.yAxisOriginalRanges !== undefined)
      this.yAxisOriginalRanges = gate.yAxisOriginalRanges;
    if (gate.name !== undefined) this.name = gate.name;
    else this.name = this.getGateType() + " " + Gate.instanceCount.toString();
    if (gate.color !== undefined) this.color = gate.color;
    else {
      this.color =
        randomListOfColors[
          (Gate.instanceCount - 1) % randomListOfColors.length
        ];
    }
    this.parents = gate.parents;
  }

  getState(): GateState {
    return {
      xAxis: this.xAxis,
      xAxisType: this.xAxisType,
      yAxis: this.yAxis,
      yAxisType: this.yAxisType,
      name: this.name,
      color: this.color,
      parents: this.parents,
    };
  }

  private instanceOfGateState(object: any): object is GateState {
    return (
      "children" in object &&
      "parents" in object &&
      "xAxis" in object &&
      "yAxis" in object &&
      "xAxisType" in object &&
      "yAxisType" in object
    );
  }

  @publishDecorator()
  update(update: GateState | any) {
    if (this.instanceOfGateState(update)) {
      this.setState(update);
    }
    if (update.name !== undefined) this.name = update.name;
    if (update.color !== undefined) this.color = update.color;
  }

  isPointInside(point: { x: number; y: number }): boolean {
    // for (const parent of this.parents) {
    //   if (!parent.isPointInside(point)) {
    //     return false;
    //   }
    // }
    return true;
  }
}
