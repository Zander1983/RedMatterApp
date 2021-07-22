class Logicle {
  EPSILON = Math.pow(2, -52);
  MAX_VALUE = (2 - this.EPSILON) * Math.pow(2, 1023);
  MIN_VALUE = Math.pow(2, -1022);
  T = 0;
  W = 0;
  M = 0;
  A = 0;
  taylor: number[] = [];
  w = 0;
  x0 = 0;
  x1 = 0;
  x2 = 0;
  b = 0;
  d = 0;
  a = 0;
  c = 0;
  xTaylor = 0;
  f = 0;

  constructor(linearMin: number, linearMax: number) {
    //−W ≤ A ≤ M − 2W,

    // T: maimum value
    // M: the range of the display in relation to the width of high data value decades - 4.5
    // W : the strength and range of linearization around zero
    // To select an appropriate value for w to generate a good display for a particular data set, we
    // obtain a reference value marking the low end of the distribution to be displayed. As described later, we
    //typically select the data value at the fifth percentile of all events that are below zero as this reference value.
    //Designating this (negative) value as “r,” and using its absolute value abs(r), w is computed as follows:
    // W = (M - log(T/abs(r)))/2
    //To achieve consistency in data display when analyzing experiments that include a number of samples to be compared,
    // it is appropriate to fix the Logicle scale (for each dimension) based on the most extreme sample present (usually one
    // with the maximum number of labels in use) and use these fixed scales to analyze all similarly stained samples in the
    // experiment. The current implementation in FlowJo bases the scale selection on a single user-specified (gated) data set.
    // A simple and probably desirable variant of this method which has not yet been implemented in user software would
    // operate on a group of data sets designated to be analyzed together. The Logicle width parameter would be evaluated for
    // each dimension in each data set, and the largest resulting width in each dimension would be selected for the common
    // displays. In general, when there are multiple populations in a single sample or multiple samples to be viewed on the same
    // display scale, the population or sample with the greatest negative extent should drive the selection of W.
    // http://onlinelibrary.wiley.com/doi/10.1002/cyto.a.20258/full

    // A - In a few situations, altering the negative data range to be greater or less than the
    // nominal quasilinear region of a standard logicle transformation may be desirable, so we have
    // introduced the formal parameter A to specify additional decades of negative data values. Figure 1 illustrates
    // the effects of different choices of the logicle parameters. As shown in Figure 1D, positive values of A can be used to
    // extend the range of negative data values on scale, however, the added scale range will not be quasilinear and can lead to
    // spurious data peaks like those seen in logarithmic displays (Fig. 1B). If there is simply a need to display more
    // negative data range, increasing W (Fig. 1E compared to 1C) will accomplish this while maintaining quasilinearity for
    // all on-scale negative values. For data that cannot include negative values, it may be advantageous to set A = −W producing
    // a display with no negative range but with zero on scale and with near-linear behavior near zero. Nonzero values of A will
    // change the display scale of large data values whose consistency is one of the desirable features of the standard
    // logicle method. The optional parameter A should not be a routinely adjusted user parameter but should instead be
    // reserved for these special cases. In general, the width parameter W is the only one that should be routinely varied,
    // and the best approach in general is to set it with respect to the most negative relevant values in the data as
    // described in the original paper (2).
    // https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4761345/

    this.taylor = [];

    // this.T = linearMax;
    // this.M = 4.5;
    // this.A = 0;
    // this.W = linearMin;
    const pckg = this.getTMWA(linearMin, linearMax);
    this.T = pckg.T;
    this.M = pckg.M;
    this.A = pckg.A;
    this.W = pckg.W;

    this.b = (this.M + this.A) * Math.log(10);
    this.w = this.W / (this.M + this.A);

    this.x2 = this.A / (this.M + this.A);
    this.x1 = this.x2 + this.w;
    this.x0 = this.x1 + this.w;

    this.d = this.solve(this.b, this.w);

    var c_a = Math.exp(this.x0 * (this.b + this.d));
    var mf_a = Math.exp(this.b * this.x1) - c_a / Math.exp(this.d * this.x1);
    this.a = this.T / (Math.exp(this.b) - mf_a - c_a / Math.exp(this.d));
    this.c = c_a * this.a;
    this.f = -mf_a * this.a;

    // use Taylor series near x1, i.e., data zero to
    // avoid round off problems of formal definition
    this.xTaylor = this.x1 + this.w / 4;
    // compute coefficients of the Taylor series
    var posCoef = this.a * Math.exp(this.b * this.x1);
    var negCoef = -this.c / Math.exp(this.d * this.x1);

    // 16 is enough for full precision of typical scales
    for (var i = 0; i < 16; ++i) {
      posCoef *= this.b / (i + 1);
      negCoef *= -this.d / (i + 1);
      this.taylor[i] = posCoef + negCoef;
    }
    this.taylor[1] = 0; // exact result of Logicle condition

    return this;
  }

  ulp(x: number) {
    return x < 0 ? this.nextUp(x) - x : x - -this.nextUp(-x);
  }

  nextUp(x: number) {
    if (x === -1 / 0) {
      return -this.MAX_VALUE;
    }
    if (x === +1 / 0) {
      return +1 / 0;
    }
    if (x === +this.MAX_VALUE) {
      return +1 / 0;
    }
    var y = x * (x < 0 ? 1 - this.EPSILON / 2 : 1 + this.EPSILON);
    if (y === x) {
      y =
        this.MIN_VALUE * this.EPSILON > 0
          ? x + this.MIN_VALUE * this.EPSILON
          : x + this.MIN_VALUE;
    }
    if (y === +1 / 0) {
      y = +this.MAX_VALUE;
    }
    var b = x + (y - x) / 2;
    if (x < b && b < y) {
      y = b;
    }
    var c = (y + x) / 2;
    if (x < c && c < y) {
      y = c;
    }
    return y === 0 ? -0 : y;
  }

  solve(b: number, w: number) {
    // w == 0 means its really arcsinh
    if (w === 0) return b;

    // precision is the same as that of b
    var tolerance = 2 * this.ulp(b);

    // based on RTSAFE from Numerical Recipes 1st Edition
    // bracket the root
    var d_lo = 0;
    var d_hi = b;

    // bisection first step
    var d = (d_lo + d_hi) / 2;
    var last_delta = d_hi - d_lo;
    var delta;

    // evaluate the f(d;w,b) = 2 * (ln(d) - ln(b)) + w * (b + d)
    // and its derivative
    var f_b = -2 * Math.log(b) + w * b;
    var f = 2 * Math.log(d) + w * d + f_b;
    var last_f = undefined;

    for (var i = 1; i < 20; ++i) {
      // compute the derivative
      var df = 2 / d + w;

      // if Newton's method would step outside the bracket
      // or if it isn't converging quickly enough
      if (
        ((d - d_hi) * df - f) * ((d - d_lo) * df - f) >= 0 ||
        Math.abs(1.9 * f) > Math.abs(last_delta * df)
      ) {
        // take a bisection step
        delta = (d_hi - d_lo) / 2;
        d = d_lo + delta;
        if (d === d_lo) return d; // nothing changed, we're done
      } else {
        // otherwise take a Newton's method step
        delta = f / df;
        var t = d;
        d -= delta;
        if (d === t) return d; // nothing changed, we're done
      }
      // if we've reached the desired precision we're done
      if (Math.abs(delta) < tolerance) return d;
      last_delta = delta;

      // recompute the function
      f = 2 * Math.log(d) + w * d + f_b;
      if (f === 0 || f === last_f) return d; // found the root or are not going to get any closer
      last_f = f;

      // update the bracketing interval
      if (f < 0) d_lo = d;
      else d_hi = d;
    }
  }

  /*
   * The slope of the biexponential at the scale point
   */
  slope(scale: number) {
    // reflect negative scale regions
    if (scale < this.x1) scale = 2 * this.x1 - scale;

    // compute the slope of the biexponential
    return (
      this.a * this.b * Math.exp(this.b * scale) +
      (this.c * this.d) / Math.exp(this.d * scale)
    );
  }

  /**
   * Computes the value of Taylor series at a point on the scale
   */
  seriesBiexponential(scale: number) {
    // Taylor series is around x1
    var x = scale - this.x1;
    // note that taylor[1] should be identically zero according
    // to the Logicle condition so skip it here
    var sum = this.taylor[this.taylor.length - 1] * x;
    for (var i = this.taylor.length - 2; i >= 2; --i)
      sum = (sum + this.taylor[i]) * x;
    return (sum * x + this.taylor[0]) * x;
  }

  /**
   * Computes the Logicle scale value of the given data value
   */
  scale(value: number) {
    // handle true zero separately
    if (value === 0) return this.x1;

    // reflect negative values
    var negative = value < 0;
    if (negative) value = -value;

    // initial guess at solution
    var x;
    if (value < this.f)
      // use linear approximation in the quasi linear region
      x = this.x1 + value / this.taylor[0];
    // otherwise use ordinary logarithm
    else x = Math.log(value / this.a) / this.b;

    // TODO java is 1D
    // try for var precision unless in extended range
    var tolerance = 3 * this.ulp(1.0);
    if (x > 1) tolerance = 3 * this.ulp(x);

    for (var i = 0; i < 10; ++i) {
      // compute the function and its first two derivatives
      var ae2bx = this.a * Math.exp(this.b * x);
      var ce2mdx = this.c / Math.exp(this.d * x);
      var y;
      if (x < this.xTaylor)
        // near zero use the Taylor series
        y = this.seriesBiexponential(x) - value;
      // this formulation has better roundoff behavior
      else y = ae2bx + this.f - (ce2mdx + value);
      var abe2bx = this.b * ae2bx;
      var cde2mdx = this.d * ce2mdx;
      var dy = abe2bx + cde2mdx;
      var ddy = this.b * abe2bx - this.d * cde2mdx;

      // this is Halley's method with cubic convergence
      var delta = y / (dy * (1 - (y * ddy) / (2 * dy * dy)));
      x -= delta;

      // if we've reached the desired precision we're done
      if (Math.abs(delta) < tolerance)
        if (negative)
          // handle negative arguments
          return 2 * this.x1 - x;
        else return x;
    }
  }

  /**
   * Computes the data value corresponding to the given point of the Logicle
   * scale. This is the inverse of the scale() function.
   */
  inverse(input: number): number {
    // reflect negative scale regions
    let negative = input < this.x1;
    if (negative) input = 2 * this.x1 - input;

    // compute the biexponential
    let inverse;
    if (input < this.xTaylor)
      // near x1, i.e., data zero use the series expansion
      inverse = this.seriesBiexponential(input);
    // this formulation has better roundoff behavior
    else
      inverse =
        this.a * Math.exp(this.b * input) +
        this.f -
        this.c / Math.exp(this.d * input);

    // handle scale for negative values
    if (negative) return -inverse;
    else return inverse;
  }

  /**
   * Computes the dynamic range of the Logicle scale. For the Logicle scales
   * this is the ratio of the pixels per unit at the high end of the scale
   * divided by the pixels per unit at zero.
   *
   * @return the var dynamic range
   */
  dynamicRange() {
    return this.slope(1) / this.slope(this.x1);
  }

  /**
   * Choose a suitable set of data coordinates for a Logicle scale
   *
   * @return a var array of data values
   */
  axisLabels() {
    // number of decades in the positive logarithmic region
    var p = this.M - 2 * this.W;
    // smallest power of 10 in the region
    var log10x = Math.ceil(Math.log(this.T) / Math.LN10 - p);
    // data value at that point
    var x = Math.exp(Math.LN10 * log10x);
    // number of positive labels
    var np;
    if (x > this.T) {
      x = this.T;
      np = 1;
    } else np = Math.floor(Math.log(this.T) / Math.LN10 - log10x) + 1;
    // bottom of scale
    var B = this.inverse(0);
    // number of negative labels
    var nn;
    if (x > -B) nn = 0;
    else if (x === this.T) nn = 1;
    else nn = Math.floor(Math.log(-B) / Math.LN10 - log10x) + 1;

    // fill in the axis labels
    var label = [nn + np + 1];
    label[nn] = 0;
    for (var i = 1; i <= nn; ++i) {
      label[nn - i] = -x;
      label[nn + i] = x;
      x *= 10;
    }
    for (let i = nn + 1; i <= np; ++i) {
      label[nn + i] = x;
      x *= 10;
    }

    return label;
  }

  calculateW = (r: number, T: number) => {
    // if (r === 0) {
    //     return 0;
    // }

    var M = 4.5;

    var W = (M - Math.log10(T / Math.abs(r))) / 2;

    if (W < 0) {
      return 0;
    }

    return W;
  };

  getTMWA = (biexponentialMinimum: number, biexponentialMaximum: number) => {
    var T = biexponentialMaximum;
    var M = 4.5;
    var A = 0;
    var W = this.calculateW(biexponentialMinimum, T);

    return {
      T: T,
      M: M,
      A: A,
      W: W,
    };
  };
}

export default Logicle;
