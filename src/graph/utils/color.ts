export type ColorStringType = string;
export type ColorNumberType = number;

export const generateColor = (seed?: number) => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

export const black = "#000";
export const white = "#fff";
export const red = "#f00";
export const green = "#0f0";
export const blue = "#00f";

export const colorString2Number = (color: string) => {
  if (color[0] === "#") color = color.substr(1);
  return (parseInt(color, 16) << 8) / 256;
};

export const colorNumber2String = function (color: number) {
  color >>>= 0;
  var b = color & 0xff,
    g = (color & 0xff00) >>> 8,
    r = (color & 0xff0000) >>> 16;
  return "#" + r.toString(16) + g.toString(16) + b.toString(16);
};

/*
  Instead of storing a list of strings for colors, this stores a list of
  indexes for static strings of colors. Makes app more efficient.
*/
export class ColorSchema {
  colors: string[];
  indexes: Int32Array;

  constructor(colors: string[]) {
    if (colors.length === 1) {
      this.colors = colors;
      return;
    }
    const newColors = Array.from(new Set(colors).values());
    this.colors = newColors;
    if (newColors.length === 1) {
      return;
    }
    let colorMap: { [index: string]: number } = {};
    this.colors.forEach((e, i) => (colorMap[e] = i));
    this.indexes = new Int32Array(colors.map((e) => colorMap[e]));
  }

  getI(i: number): string {
    if (this.colors.length === 1) {
      return this.colors[0];
    }
    return this.colors[this.indexes[i]];
  }
}
