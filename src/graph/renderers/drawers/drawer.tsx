/*
    This is responsible for drawing basic canvas shapes
*/
interface BaseParams {
  fillColor?: string;
  strokeColor?: string;
  lineWidth?: number;
  x?: number;
  y?: number;
}

interface CircleParams extends BaseParams {
  radius: number;
}

interface LineParams extends BaseParams {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface TextParams extends BaseParams {
  text: string;
  font?: string;
}

interface RectParams extends BaseParams {
  h: number;
  w: number;
  fill: boolean;
}

export default abstract class Drawer {
  protected ctx: any;

  constructor() {}

  abstract convertToAbstractPoint(
    x: number,
    y: number
  ): { x: number; y: number };

  protected setFillColor(color: string | undefined) {
    if (color == undefined) return;
    this.ctx.fillStyle = color;
  }

  protected setStrokeColor(color: string | undefined) {
    if (color == undefined) return;
    this.ctx.strokeStyle = color;
  }

  protected setLineWidth(width: number | undefined) {
    if (width == undefined) return;
    this.ctx.lineWidth = width;
  }

  protected setFont(font: string | undefined) {
    if (font == undefined) return;
    this.ctx.font = font;
  }

  protected setDefaultStyle() {
    this.ctx.strokeStyle = "#000";
    this.ctx.fillStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.font = "10px Arial";
  }

  setContext(context: any) {
    this.ctx = context;
  }

  circle({ x, y, radius, fillColor, strokeColor }: CircleParams) {
    this.setStrokeColor(strokeColor);
    this.setFillColor(fillColor);

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();

    this.setDefaultStyle();
  }

  line({ x1, y1, x2, y2, lineWidth, strokeColor }: LineParams) {
    this.setStrokeColor(strokeColor);
    this.setLineWidth(lineWidth);

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();

    this.setDefaultStyle();
  }

  text({ x, y, text, font, fillColor }: TextParams) {
    this.setFillColor(fillColor);

    if (font !== undefined) {
      this.ctx.font = font;
    }
    this.ctx.fillText(text, x, y);
    this.ctx.font = "Arial";

    this.setDefaultStyle();
  }

  rect({ x, y, w, h, fill, strokeColor, fillColor }: RectParams) {
    this.setFillColor(fillColor);
    this.setStrokeColor(strokeColor);

    this.ctx.beginPath();
    this.ctx.rect(x, y, w, h);

    if (fill) this.ctx.fill();
    else this.ctx.stroke();

    this.setDefaultStyle();
  }
}
