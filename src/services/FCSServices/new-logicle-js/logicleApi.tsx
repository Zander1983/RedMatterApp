import Logicle from "./logicle";

class LogicleAPI {
  constructor() {}

  logicleTransform(
    input: number[],
    T: number,
    W: number,
    M: number,
    A: number,
    isInverse: boolean = false
  ) {
    let nLen = input.length;
    const lg = new Logicle(T, W, M, A);
    for (let i = 0; i < nLen; i++) {
      if (isNaN(input[i])) continue;
      if (isInverse) input[i] = lg.inverse(input[i]);
      else input[i] = lg.scale(input[i]);
    }
    return input;
  }
}

export default LogicleAPI;
