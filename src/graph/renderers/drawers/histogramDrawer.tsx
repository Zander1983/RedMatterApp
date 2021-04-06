import GraphDrawer, {
  GraphDrawerState,
} from "graph/renderers/drawers/graphDrawer";

const binPadding = 5;

interface HistogramDrawerState extends GraphDrawerState {
  binSize: number;
}

//@ts-ignore
export default class HistogramDrawer extends GraphDrawer {
  private binSize: number;
  private bins: number;
  private axis: "vertical" | "horizontal" = "vertical";

  update() {
    this.bins = Math.floor((this.x2 - this.x1) / this.binSize);
    if (this.axis === "vertical") {
      this.ypts = Math.round(
        (Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2)) / 100
      );
    } else {
      this.xpts = Math.round(
        (Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2)) / 100
      );
    }
    super.update();
  }

  setDrawerState(state: HistogramDrawerState) {
    super.setDrawerState(state);
  }

  getDrawerState(): HistogramDrawerState {
    return {
      ...super.getDrawerState(),
      binSize: this.binSize,
    };
  }

  /* TODO FIX THIS SHIT WHEN EVERYTHING IS IN PLACE */
  drawLines() {
    if (this.axis == "vertical") {
      // Horizontal hist lines
      for (let i = 0; i < this.ypts; i++) {
        const height =
          (Math.abs(this.y1 - this.y2) / this.ypts) * i +
          Math.min(this.y1, this.y2);
        this.segment({
          x1: this.x1,
          y1: height,
          x2: this.x2,
          y2: height,
          strokeColor: "#bababa",
        });
      }
      // Last vertical hist line
      this.segment({
        x1: this.x2,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        strokeColor: "#bababa",
      });
    } else {
      // vertical hist lines
      for (let i = 0; i <= this.xpts; i++) {
        const width =
          (Math.abs(this.x1 - this.x2) / this.xpts) * i +
          Math.min(this.x1, this.x2);
        this.segment({
          y1: this.y1,
          x1: width,
          y2: this.y2,
          x2: width,
          strokeColor: "#bababa",
        });
      }

      // Last horizontal hist line
      this.segment({
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y1,
        strokeColor: "#bababa",
      });
    }
  }

  /* TODO FIX THIS SHIT WHEN EVERYTHING IS IN PLACE */
  addBin(index: number, heightPercentage: number, color: string = "#66a") {
    if (this.axis === "vertical") {
      this.binSize = (this.x2 - this.x1) / this.bins;
      if (this.bins <= index) {
        throw Error(`Out of bounds index for histogram with ${this.bins} bins`);
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
        throw Error(`Out of bounds index for histogram with ${this.bins} bins`);
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
}
