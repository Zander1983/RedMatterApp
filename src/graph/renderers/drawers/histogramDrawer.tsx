import GraphDrawer, {
  GraphDrawerState,
} from "graph/renderers/drawers/graphDrawer";
import { Label } from "../transformers/graphTransformer";

const binPadding = 0;

interface HistogramDrawerState extends GraphDrawerState {
  axis: "vertical" | "horizontal";
  bins: number;
}

//@ts-ignore
export default class HistogramDrawer extends GraphDrawer {
  private binSize: number;
  private bins: number;
  public axis: "vertical" | "horizontal" = "vertical";

  update() {
    super.update();
  }

  setDrawerState(state: HistogramDrawerState) {
    super.setDrawerState(state);
    this.axis = state.axis;
    this.bins = state.bins;
  }

  getDrawerState(): HistogramDrawerState {
    return {
      ...super.getDrawerState(),
      bins: this.bins,
      axis: this.axis,
    };
  }

  drawPlotGraph(params: {
    lines: boolean;
    vbins?: number;
    hbins?: number;
    xAxisLabel?: string;
    yAxisLabel?: string;
    xLabels: Label[];
    yLabels: Label[];
  }): void {
    super.drawPlotGraph(params);
  }

  /* TODO FIX THIS SHIT WHEN EVERYTHING IS IN PLACE */
  addBin(index: number, heightPercentage: number, color: string = "#66a") {
    if (this.axis === "vertical") {
      this.binSize = (this.x2 - this.x1) / this.bins;
      if (this.bins <= index) {
        return;
      }
      const outterBeginX = this.x1 + index * this.binSize;
      const outterEndX = this.x1 + (index + 1) * this.binSize;
      const innerBeginX = outterBeginX + binPadding;
      const innerEndX = outterEndX - binPadding;
      const y = (this.y2 - this.y1) * (1 - heightPercentage) + this.y1;

      this.rect({
        x: innerBeginX,
        y: y,
        w: innerEndX - innerBeginX,
        h: (this.y2 - this.y1) * heightPercentage,
        fill: true,
        fillColor: color,
      });
    } else {
      this.binSize = (this.y2 - this.y1) / this.bins;
      if (this.bins <= index) {
        return;
      }
      const outterBeginY = this.y1 + (this.bins - 1 - index) * this.binSize;
      const outterEndY = this.y1 + (this.bins - index) * this.binSize;
      const innerBeginY = outterBeginY + binPadding;
      const innerEndY = outterEndY - binPadding;

      this.rect({
        x: this.x1,
        y: innerBeginY,
        h: innerEndY - innerBeginY,
        w: (this.x2 - this.x1) * heightPercentage,
        fill: true,
        fillColor: color,
      });
    }
  }

  getBinPos(index: number, heightPercentage: number, binsOverride?: number) {
    const bins = binsOverride === undefined ? this.bins : binsOverride;
    if (this.axis === "vertical") {
      this.binSize = (this.x2 - this.x1) / bins;
      if (bins <= index) {
        if (index >= bins) index = bins - 1;
        // throw Error(
        //   `Out of bounds index ${index} for histogram with ${bins} bins`
        // );
      }
      const outterBeginX = this.x1 + index * this.binSize;
      const innerBeginX = outterBeginX + binPadding;
      const y = (this.y2 - this.y1) * (1 - heightPercentage) + this.y1;

      return {
        x: innerBeginX,
        y: y,
      };
    } else {
      this.binSize = (this.y2 - this.y1) / bins;
      if (bins <= index) {
        throw Error(`Out of bounds index for histogram with ${bins} bins`);
      }
      const outterBeginY = this.y1 + (bins - 1 - index) * this.binSize;
      const innerBeginY = outterBeginY + binPadding;

      return {
        x: this.x1 + (this.x2 - this.x1) * heightPercentage,
        y: innerBeginY,
      };
    }
  }
}
