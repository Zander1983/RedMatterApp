/*
    Responsible for providing a scatterplot with the input data
*/
import GraphCanvas from "../canvas/graphCanvas";
import Context from "../canvas/contextInterface";
import GraphDrawer from "../drawers/graphDrawer";
import ScatterPlotGraph from "../ScatterPlotGraph";

interface ScatterPlotParams {
  data: Array<[number, number]>;
  xAxis: { key: number; value: string }; // { key: 3, value: "FCS-A" }
  yAxis: { key: number; value: string }; // { key: 7, value: "FTP-S" }
  xLabels?: Array<string> | undefined; // ["10^-2", "3^-1", ...] or ["1000", "2000", ...]
  yLabels?: Array<string> | undefined; // ["10^-2", "3^-1", ...] or ["1000", "2000", ...]
  xRange?: [number, number] | undefined; // [0, 2000], or [10^5, 10^10]
  yRange?: [number, number] | undefined; // [0, 2000], or [10^5, 10^10]
  width?: number;
  height?: number;
}

export default class ScatterPlot {
  // Obrigatory params
  data: Array<[number, number]>;
  xAxis: { key: number; value: string };
  yAxis: { key: number; value: string };

  // Optional params
  xLabels: Array<string>;
  yLabels: Array<string>;
  xRange: [number, number];
  yRange: [number, number];
  width: number;
  height: number;

  // Internal
  drawer: GraphDrawer | null;
  canvas: GraphCanvas;

  // Constant
  rangeSpacer: number = 0.05;
  scale: number = 2;

  constructor({
    data,
    xAxis,
    yAxis,
    xLabels = undefined,
    yLabels = undefined,
    xRange = undefined,
    yRange = undefined,
    width = 700,
    height = 600,
  }: ScatterPlotParams) {
    this.data = data;
    this.xAxis = xAxis;
    this.yAxis = yAxis;

    this.width = width;
    this.height = height;

    this.xRange = xRange === undefined ? this.findRangeBoundries("x") : xRange;
    this.yRange = yRange === undefined ? this.findRangeBoundries("y") : yRange;

    this.xLabels = xLabels === undefined ? this.createRangeArray("x") : xLabels;
    this.yLabels = yLabels === undefined ? this.createRangeArray("y") : yLabels;

    this.drawer = null;
    this.canvas = new GraphCanvas({
      scale: this.scale,
      parentref: this,
      style: {
        width: this.width,
        height: this.height,
      },
    });
  }

  createRangeArray(axis: "x" | "y"): Array<string> {
    const plotSize = axis === "x" ? this.width : this.height;
    const rangeSize =
      axis === "x"
        ? this.xRange[1] - this.xRange[0]
        : this.yRange[1] - this.yRange[0];
    const rangeMin = axis === "x" ? this.xRange[0] : this.yRange[0];
    const lineCount = Math.round(plotSize / 100);
    return Array(lineCount).map((e, i) =>
      ((rangeSize * i) / lineCount + rangeMin).toString()
    );
  }

  findRangeBoundries(axis: "x" | "y"): [number, number] {
    const iaxis = axis === "x" ? 0 : 1;
    let min = this.data[0][iaxis],
      max = this.data[0][iaxis];
    this.data.forEach((e) => {
      min = Math.min(e[iaxis], min);
      max = Math.max(e[iaxis], max);
    });
    const d = Math.max(max - min, 0.1);
    return [min - d * this.rangeSpacer, max + d * this.rangeSpacer];
  }

  setData() {}

  setGates() {}

  setLabels() {}

  // time: Date = new Date()
  // str: string = '0'
  // fc: number = 0

  draw(context: Context, frameCount: number) {
    if (this.drawer == null) {
      this.drawer = new GraphDrawer({
        context: context,
        x1: 70 * this.scale,
        y1: 50 * this.scale,
        x2: (this.width - 50) * this.scale,
        y2: (this.height - 50) * this.scale,
        ibx: this.xRange[0],
        iex: this.xRange[1],
        iby: this.yRange[0],
        iey: this.yRange[1],
      });
    }

    // this.fc++
    // const now = new Date()
    // if (now.getTime() - this.time.getTime() > 1000) {
    //     this.str = this.fc.toString()
    //     this.fc = 0
    //     this.time = now
    // }

    // this.drawer.text({
    //     x: 40,
    //     y: 40,
    //     text: 'Frames per second: ' + this.str,
    //     font: '30px Arial'
    // })

    let plotGraph = this.drawer.drawPlotGraph();

    this.data.forEach((point: [number, number]) => {
      plotGraph.addPoint(point[this.xAxis.key], point[this.yAxis.key]);
    });

    // for each gate:
    //     plotgraph.drawPolygon()
  }

  registerMouseEvent(event: any) {
    // console.log(event.type)
  }

  getCanvas() {
    return this.canvas.getCanvasComponent(this.draw);
  }

  getMouseEvents() {}
}
