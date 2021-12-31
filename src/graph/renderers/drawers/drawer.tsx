export interface DrawerState {}

/*
  How to use drawers?
   1. Instance the drawer (no args)
   2. Set Drawer state with setDrawerState(state)
   3. Call setup()

  You are now ready to go!
  
  If you ever need to update the Drawer
   1. Call setDrawerState(state)
   2. Call update()

  Notes on drawers: Drawers expect ONLY concrete data. No points should ever be
  passed to a drawer that are NOT concrete. Concrete point = transformer
*/
const resetStyleAfter = () => {
  return function (
    target: Drawer,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      original.apply(this, args);
      //@ts-ignore
      this.setDefaultStyle();
    };
  };
};

export default abstract class Drawer {
  protected ctx: any;

  setup(canvasContext: any) {
    this.ctx = canvasContext;
  }

  update() {}

  getDrawerState(): DrawerState {
    return {};
  }

  setDrawerState(state: DrawerState) {}

  @resetStyleAfter()
  circle(params: {
    x: number;
    y: number;
    radius: number;
    fill?: boolean;
    fillColor?: string;
    strokeColor?: string;
  }) {
    this.setStrokeColor(params.strokeColor);
    this.setFillColor(params.fillColor);

    this.ctx.beginPath();
    this.ctx.arc(params.x, params.y, params.radius, 0, 2 * Math.PI);

    if (params.fill === undefined || params.fill === true) {
      this.ctx.fill();
    } else {
      this.ctx.stoke();
    }
  }

  @resetStyleAfter()
  segment(params: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    lineWidth?: number;
    strokeColor?: string;
  }) {
    this.setStrokeColor(params.strokeColor);
    this.setLineWidth(params.lineWidth);

    this.ctx.beginPath();
    this.ctx.moveTo(params.x1, params.y1);
    this.ctx.lineTo(params.x2, params.y2);
    this.ctx.stroke();
  }

  @resetStyleAfter()
  text(params: {
    x: number;
    y: number;
    text: string;
    font?: string;
    fillColor?: string;
    rotate?: number;
  }) {
    this.setFillColor(params.fillColor);

    if (params.font !== undefined) {
      this.ctx.font = params.font;
    }
    if (params.rotate !== undefined) {
      this.ctx.rotate(params.rotate);
      const bx = params.x;
      const by = params.y;
      params.x = -bx * Math.cos(params.rotate) + by * Math.sin(params.rotate);
      params.y = -bx * Math.sin(params.rotate) - by * Math.cos(params.rotate);
    }
    this.ctx.fillText(params.text, params.x, params.y);
    this.ctx.font = "Arial";
    if (params.rotate !== undefined) {
      this.ctx.rotate(-params.rotate);
    }
  }

  @resetStyleAfter()
  rect(params: {
    x: number;
    y: number;
    w: number;
    h: number;
    fill?: boolean;
    strokeColor?: string;
    fillColor?: string;
  }) {
    this.setFillColor(params.fillColor);
    this.setStrokeColor(params.strokeColor);

    this.ctx.beginPath();
    this.ctx.rect(params.x, params.y, params.w, params.h);

    if (params.fill === true || params.fill === undefined) this.ctx.fill();
    else this.ctx.stroke();
  }

  @resetStyleAfter()
  oval(params: {
    x: number;
    y: number;
    d1: number;
    d2: number;
    ang: number;
    fill: boolean;
    strokeColor?: string;
    fillColor?: string;
    lineWidth?: number;
  }) {
    this.setStrokeColor(params.strokeColor);
    this.setFillColor(params.fillColor);
    this.setLineWidth(params.lineWidth);

    this.ctx.beginPath();
    this.ctx.ellipse(
      params.x,
      params.y,
      params.d1,
      params.d2,
      params.ang,
      0,
      2 * Math.PI
    );

    if (params.fill === false || params.fill === undefined) this.ctx.stroke();
    else this.ctx.fill();
  }

  @resetStyleAfter()
  ellipse(params: {
    mouseX: number;
    mouseY: number;
    mouseLastX: number;
    mouseLastY: number;
    color: string;
  }) {
    // initializing the canvas

    this.setLineWidth(2);
    this.ctx.beginPath();

    // setting the scale
    const scaleX = 1 * ((params.mouseX - params.mouseLastX) / 2);
    const scaleY = 1 * ((params.mouseY - params.mouseLastY) / 2);

    // setting up the centers
    const centerX = params.mouseLastX / scaleX + 1;
    const centerY = params.mouseLastY / scaleY + 1;

    // drawing the ellipse
    this.setStrokeColor(params.color);
    this.ctx.globalAlpha = 0.75;
    this.setFillColor(params.color);
    this.ctx.scale(scaleX, scaleY);
    this.ctx.arc(centerX, centerY, 1, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  @resetStyleAfter()
  curve(params: {
    points: { x: number; y: number }[];
    lineWidth?: number;
    strokeColor?: string;
  }) {
    this.setStrokeColor(params.strokeColor);
    this.setLineWidth(params.lineWidth);
    const points = params.points;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      let x_mid = (points[i].x + points[i + 1].x) / 2;
      let y_mid = (points[i].y + points[i + 1].y) / 2;
      let cp_x1 = (x_mid + points[i].x) / 2;
      let cp_x2 = (x_mid + points[i + 1].x) / 2;
      // this.segment({
      //   x1: points[i].x,
      //   y1: points[i].y,
      //   x2: points[i + 1].x,
      //   y2: points[i + 1].y,
      // });
      this.ctx.quadraticCurveTo(cp_x1, points[i].y, x_mid, y_mid);
      this.ctx.quadraticCurveTo(
        cp_x2,
        points[i + 1].y,
        points[i + 1].x,
        points[i + 1].y
      );
    }
    this.ctx.stroke();
  }

  protected setFillColor(color: string | undefined) {
    if (color === undefined) return;
    this.ctx.fillStyle = color;
  }

  protected setStrokeColor(color: string | undefined) {
    if (color === undefined) return;
    this.ctx.strokeStyle = color;
  }

  protected setLineWidth(width: number | undefined) {
    if (width === undefined) return;
    this.ctx.lineWidth = width;
  }

  protected setFont(font: string | undefined) {
    if (font === undefined) return;
    this.ctx.font = font;
  }

  protected setDefaultStyle() {
    this.ctx.strokeStyle = "#000";
    this.ctx.fillStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.font = "10px Arial";
  }
}
