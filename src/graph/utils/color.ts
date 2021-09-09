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
