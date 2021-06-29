const api = require("logicle-trans");

class V {
  logicleT = 262144;
  logicleM = 100;
  logicleW = 0;
  logicleA = 0;

  constructor() {}

  logicleMetadataSetter(params) {
    const { T, M, W, A } = params;
    this.logicleT = T;
    this.logicleM = M;
    this.logicleW = W;
    this.logicleA = A;
  }

  logicleTransformer(data) {
    return api.LogicleTransform(
      data,
      this.logicleT,
      this.logicleM,
      this.logicleW,
      this.logicleA
    );
  }
}

const testI = new V();
const res = testI.logicleTransformer([
  -10000, -1000, -100, -10, 1, 2, 3, 4, 5, 10, 100, 1000, 10000, 100000,
  1000000, 100000000,
]);
console.log(res);
