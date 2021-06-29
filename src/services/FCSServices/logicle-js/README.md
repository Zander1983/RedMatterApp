# logicle-js
This npm package provides some of the transformation functions of the package [flowCore](https://github.com/RGLab/flowCore). The underlying cpp code is copied from flowCore with a slight modification, which will be described later, and exported to javascript through v8 and NAN.

Logicle is a transformation method which aims to give a better visualization of the data and is described in [this paper](https://onlinelibrary.wiley.com/doi/full/10.1002/cyto.a.20258) and [this paper](https://onlinelibrary.wiley.com/doi/full/10.1002/cyto.a.22030). In short, the authors aim to provide a function which is an approximation of a linear function at around zero value and becomes logarithmic for larger values. They do so by forming a generalized version of the hyperbolic sine function: <img src="https://render.githubusercontent.com/render/math?math=S(x%3Ba,b,c,d,e,f)=+ae^{bx}-ce^{-dx}%2Bf">, whose the parameters a, b, c, d and f can be tuned for different datasets. The strategy for tuning the parameters is also described in the papers. Furthermore, instead of tuning those five parameters, the authors suggest using a more specific version of the function which involves four parameters, namely:
- T: The top of scale data value (e.g., 10,000 for common 4 decade data or 262,144 for an 18 bit data range).
- M: The breadth of the display in natural log units.
- W: The width of the range of linearized data in natural log units.
- A: The width of the negative data range in log units.

Those are the actual parameters that will be chosen by the user and passed to the functions of this package.

# Installation
```bash
$ npm install logicle-trans
```

# Usage
```javascript
const api = require("logicle-trans");
// Available functions:
// LogicleTransform = function(x, T, M, W, A, inverse=false);
// FastLogicleTransform = function(x, T, M, W, A, inverse=false);
// HyperlogTransform = function(x, T, M, W, A, inverse=false);
api.LogicleTransform([3, 1.4, 7,2, 1000], 262144, 4.5, 0, 0);
```
