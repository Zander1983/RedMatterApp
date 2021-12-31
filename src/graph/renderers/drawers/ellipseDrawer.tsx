import GraphDrawer from "graph/renderers/drawers/graphDrawer";

export interface EllipseDrawerState {
  canvasX: number;
  canvasY: number;
  mouseX: number;
  mouseY: number;
  mouseLastX: number;
  mouseLastY: number;
}

export default class EllipseDrawer extends GraphDrawer {
  addEllipse(params: {
    mouseX: number;
    mouseY: number;
    mouseLastX: number;
    mouseLastY: number;
    color: string;
  }) {
    this.ellipse(params);
  }
}
