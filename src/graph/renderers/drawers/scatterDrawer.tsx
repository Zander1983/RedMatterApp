import GraphDrawer, {
  GraphDrawerState,
} from "graph/renderers/drawers/graphDrawer";
import {
  euclidianDistance2D,
  getVectorAngle2D,
} from "graph/utils/euclidianPlane";

interface ScatterDrawerState extends GraphDrawerState {}

export default class ScatterDrawer extends GraphDrawer {
  update() {
    super.update();
  }

  setDrawerState(state: ScatterDrawerState) {
    super.setDrawerState(state);
  }

  getDrawerState(): ScatterDrawerState {
    return {
      ...super.getDrawerState(),
    };
  }

  addPoint = (x: number, y: number, r: number, color: string = "#000") => {
    this.rect({
      x: x * this.scale,
      y: y * this.scale,
      w: 3,
      h: 3,
      fillColor: color,
    });
  };

  addPolygon = (
    polygon: { x: number; y: number }[],
    color: string = "#000"
  ) => {
    const pl = polygon.length;
    for (let i = 0; i < pl; i++) {
      const pa = polygon[i];
      const pb = polygon[(i + 1) % pl];
      this.segment({
        x1: pa.x * this.scale,
        y1: pa.y * this.scale,
        x2: pb.x * this.scale,
        y2: pb.y * this.scale,
        strokeColor: color,
      });
    }
  };

  addOval = (
    oval: {
      c: { x: number; y: number };
      p1: { x: number; y: number };
      p2: { x: number; y: number };
      s1: { x: number; y: number };
      s2: { x: number; y: number };
    },
    color: string = "#000"
  ) => {
    const d1 = euclidianDistance2D(oval.p1, oval.p2);
    const d2 = euclidianDistance2D(oval.s1, oval.s2);

    const ang = getVectorAngle2D(oval.p1, oval.p2);

    this.oval({
      x: oval.c.x * this.scale,
      y: oval.c.y * this.scale,
      d1: (d1 / 2) * this.scale,
      d2: (d2 / 2) * this.scale,
      ang: ang,
      fill: false,
    });
  };

  addSegment = (
    pa: { x: number; y: number },
    pb: { x: number; y: number },
    color: string = "#000"
  ) => {
    this.segment({
      x1: pa.x * this.scale,
      y1: pa.y * this.scale,
      x2: pb.x * this.scale,
      y2: pb.y * this.scale,
      strokeColor: color,
    });
  };
}
