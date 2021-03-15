import CanvasComponent from "./CanvasComponent";
import Context from "./contextInterface";

interface Point {
  x: number;
  y: number;
}

interface GraphCanvasInput {
  style?: object;
  scale?: number;
  parentref: any;
}

export default class GraphCanvas {
  style: object;
  canvas: JSX.Element | null;
  parentref: any;
  scale: number = 1;

  constructor(params?: GraphCanvasInput) {
    this.style = {
      width: 1000,
      height: 1000,
      backgroundColor: "#fafafa",
    };
    this.canvas = null;
    this.parentref = null;
    if (params === undefined) {
      throw Error("Parent not assinged");
    }
    if (params.scale !== undefined) {
      this.scale = params.scale;
    }
    this.parentref = params.parentref;
    if (params.style !== undefined) {
      this.style = params.style;
    }
  }

  getCanvasComponent(draw: Function) {
    if (this.canvas == null) {
      this.canvas = (
        <CanvasComponent parent={this.parentref} style={this.style} />
      );
    }
    return (
      <CanvasComponent
        parent={this.parentref}
        style={this.style}
        scale={this.scale}
      />
    );
  }

  getScale() {
    return this.scale;
  }
}
