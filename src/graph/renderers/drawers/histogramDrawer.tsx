import GraphDrawer, {
  GraphDrawerState,
} from "graph/renderers/drawers/graphDrawer";
import { Label } from "../transformers/graphTransformer";

const binPadding = 0;

interface HistogramDrawerState extends GraphDrawerState {
  bins: number;
}

//@ts-ignore
export default class HistogramDrawer extends GraphDrawer {
  private binSize: number;
  private bins: number;

  update() {
    super.update();
  }

  setDrawerState(state: HistogramDrawerState) {
    super.setDrawerState(state);
    this.bins = state.bins;
  }

  getDrawerState(): HistogramDrawerState {
    return {
      ...super.getDrawerState(),
      bins: this.bins,
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

  addBin(index: number, heightPercentage: number, color: string = "#66a") {
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
      y: y - 25,
      w: innerEndX - innerBeginX,
      h: (this.y2 - this.y1) * heightPercentage,
      fill: true,
      fillColor: color,
    });
  }

  getBinPos(index: number, heightPercentage: number, binsOverride?: number) {
    const bins = binsOverride === undefined ? this.bins : binsOverride;
    this.binSize = (this.x2 - this.x1) / bins;
    if (bins <= index) {
      if (index >= bins) index = bins - 1;
    }
    const outterBeginX = this.x1 + index * this.binSize;
    const innerBeginX = outterBeginX + binPadding;
    const y = (this.y2 - this.y1) * (1 - heightPercentage) + this.y1;

    return {
      x: innerBeginX,
      y: y,
    };
  }
}
