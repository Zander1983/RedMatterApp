class Logicle {
  DEFAULT_DECADES = 4.5;
  LN_10 = Math.log(10);
  EPSILON = 1e10;
  TAYLOR_LENGTH = 16;

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

  initialize(T: number, W: number, M: number, A: number, bins: number = 0) {
    // allocate the parameter structure

    this.taylor = [];
    if (T <= 0) throw Error("IllegalParameter: T is not positive");
    if (W < 0) throw Error("IllegalParameter: W is not positive");
    if (M <= 0) throw Error("IllegalParameter: M is not positive");
    if (2 * W > M) throw Error("IllegalParameter: W is too large");
    if (-A > W || A + W > M - W)
      throw Error("IllegalParameter: A is too large");

    // if we're going to bin the data make sure that
    // zero is on a bin boundary by adjusting A
    if (bins > 0) {
      let zero = (W + A) / (M + A);
      zero = Math.floor(zero * bins + 0.5) / bins;
      A = (M * zero - W) / (1 - zero);
    }

    // standard parameters
    this.T = T;
    this.M = M;
    this.W = W;
    this.A = A;

    // actual parameters
    // formulas from biexponential paper
    this.w = W / (M + A);
    this.x2 = A / (M + A);
    this.x1 = this.x2 + this.w;
    this.x0 = this.x2 + 2 * this.w;
    this.b = (M + A) * this.LN_10;
    this.d = this.solve(this.b, this.w);
    let c_a = Math.exp(this.x0 * (this.b + this.d));
    let mf_a = Math.exp(this.b * this.x1) - c_a / Math.exp(this.d * this.x1);
    this.a = T / (Math.exp(this.b) - mf_a - c_a / Math.exp(this.d));
    this.c = c_a * this.a;
    this.f = -mf_a * this.a;

    // use Taylor series near x1, i.e., data zero to
    // avoid round off problems of formal definition
    this.xTaylor = this.x1 + this.w / 4;
    // compute coefficients of the Taylor series
    let posCoef = this.a * Math.exp(this.b * this.x1);
    let negCoef = -this.c / Math.exp(this.d * this.x1);
    // 16 is enough for full precision of typical scales
    this.taylor = Array(this.TAYLOR_LENGTH).fill(0);
    for (let i = 0; i < this.TAYLOR_LENGTH; ++i) {
      posCoef *= this.b / (i + 1);
      negCoef *= -this.d / (i + 1);
      this.taylor[i] = posCoef + negCoef;
    }
    this.taylor[1] = 0; // exact result of Logicle condition
  }

  constructor(T: number, W: number, M: number, A: number, bins: number = 0) {
    this.initialize(T, W, M, A, bins);
  }

  logicle_fn(x: number, info: any) {
    const B = 2 * (Math.log(x) - Math.log(info.b)) + info.w * (info.b + x);
    return B;
  }

  // /*
  //  * root finder routines are copied from stats/src/zeroin.c
  //  */
  R_zeroin(
    /* An estimate of the root */
    ax: number /* Left border | of the range	*/,
    bx: number /* Right border| the root is seeked*/,
    f: (x: number, info: any) => number /* Function under investigation	*/,
    info: any /* Add'l info passed on to f	*/,
    Tol: number /* Acceptable tolerance		*/,
    Maxit: number /* Max # of iterations */
  ) {
    const fa = f(ax, info);
    const fb = f(bx, info);
    return this.R_zeroin2(ax, bx, fa, fb, f, info, Tol, Maxit);
  }

  // /* R_zeroin2() is faster for "expensive" f(), in those typical cases where
  //  *             f(ax) and f(bx) are available anyway : */
  R_zeroin2(
    /* An estimate of the root */
    ax: number /* Left border | of the range	*/,
    bx: number /* Right border| the root is seeked*/,
    fa: number,
    fb: number /* f(a), f(b) */,
    f: (x: number, info: any) => number /* Function under investigation	*/,
    info: any /* Add'l info passed on to f	*/,
    Tol: number /* Acceptable tolerance		*/,
    Maxit: number /* Max # of iterations */
  ) {
    let a, b, c, fc; /* Abscissae, descr. see above,  f(c) */
    let tol;
    let maxit;

    a = ax;
    b = bx;
    c = a;
    fc = fa;
    maxit = Maxit + 1;
    tol = Tol;

    /* First test if we have found a root at an endpoint */
    if (fa === 0.0) {
      Tol = 0.0;
      Maxit = 0;
      return a;
    }
    if (fb === 0.0) {
      Tol = 0.0;
      Maxit = 0;
      return b;
    }

    while (maxit--) {
      /* Main iteration loop	*/
      let prev_step = b - a; /* Distance from the last but one
  					   to the last approximation	*/
      let tol_act; /* Actual tolerance		*/
      let p; /* Interpolation step is calcu- */
      let q;
      /* lated in the form p/q; divi-
       * sion operations is delayed
       * until the last moment	*/
      let new_step; /* Step at this iteration	*/

      if (Math.abs(fc) < Math.abs(fb)) {
        /* Swap data for b to be the	*/
        a = b;
        b = c;
        c = a; /* best approximation		*/
        fa = fb;
        fb = fc;
        fc = fa;
      }
      tol_act = 2 * this.EPSILON * Math.abs(b) + tol / 2;
      new_step = (c - b) / 2;

      if (Math.abs(new_step) <= tol_act || fb === 0) {
        Maxit -= maxit;
        Tol = Math.abs(c - b);
        return b; /* Acceptable approx. is found	*/
      }

      /* Decide if the interpolation can be tried	*/
      if (
        Math.abs(prev_step) >= tol_act /* If prev_step was large enough*/ &&
        Math.abs(fa) > Math.abs(fb)
      ) {
        /* and was in true direction,
         * Interpolation may be tried	*/
        let t1, cb, t2;
        cb = c - b;
        if (a === c) {
          /* If we have only two distinct	*/
          /* points linear interpolation	*/
          t1 = fb / fa; /* can only be applied		*/
          p = cb * t1;
          q = 1.0 - t1;
        } else {
          /* Quadric inverse interpolation*/

          q = fa / fc;
          t1 = fb / fc;
          t2 = fb / fa;
          p = t2 * (cb * q * (q - t1) - (b - a) * (t1 - 1.0));
          q = (q - 1.0) * (t1 - 1.0) * (t2 - 1.0);
        }
        if (p > 0) /* p was calculated with the */ q = -q;
        /* opposite sign; make p positive */
        /* and assign possible minus to	*/ else p = -p; /* q				*/

        if (
          p <
            0.75 * cb * q -
              Math.abs(tol_act * q) / 2 /* If b+p/q falls in [b,c]*/ &&
          p < Math.abs((prev_step * q) / 2)
        )
          /* and isn't too large	*/
          new_step = p / q;
        /* it is accepted
         * If p/q is too large then the
         * bisection procedure can
         * reduce [b,c] range to more
         * extent */
      }

      if (Math.abs(new_step) < tol_act) {
        /* Adjust the step to be not less*/
        if (new_step > 0) /* than tolerance		*/ new_step = tol_act;
        else new_step = -tol_act;
      }
      a = b;
      fa = fb; /* Save the previous approx. */
      b += new_step;
      fb = f(b, info); /* Do step to a new approxim. */
      if ((fb > 0 && fc > 0) || (fb < 0 && fc < 0)) {
        /* Adjust c for it to have a sign opposite to that of b */
        c = a;
        fc = fa;
      }
    }
    /* failed! */
    Tol = Math.abs(c - b);
    Maxit = -1;
    return b;
  }

  // /*
  //  * use R built-in root finder API :R_zeroin
  //  */
  solve(b: number, w: number) {
    // w === 0 means its really arcsinh
    if (w === 0) return b;

    // precision is the same as that of b
    let tolerance = 2 * b * this.EPSILON;
    let params: any = {};
    params.b = b;
    params.w = w;

    // bracket the root
    let d_lo = 0;
    let d_hi = b;

    let MaxIt = 20;
    let d;
    d = this.R_zeroin(d_lo, d_hi, this.logicle_fn, params, tolerance, MaxIt);
    return d;
  }

  slope(scale: number) {
    // reflect negative scale regions
    if (scale < this.x1) scale = 2 * this.x1 - scale;

    // compute the slope of the biexponential
    return (
      this.a * this.b * Math.exp(this.b * scale) +
      (this.c * this.d) / Math.exp(this.d * scale)
    );
  }

  seriesBiexponential(scale: number) {
    // Taylor series is around x1
    let x: number = scale - this.x1;
    // note that taylor[1] should be identically zero according
    // to the Logicle condition so skip it here
    let sum = this.taylor[this.TAYLOR_LENGTH - 1] * x;
    for (let i = this.TAYLOR_LENGTH - 2; i >= 2; --i)
      sum = (sum + this.taylor[i]) * x;
    return (sum * x + this.taylor[0]) * x;
  }

  scale(value: number) {
    // handle true zero separately
    if (value === 0) return this.x1;

    // reflect negative values
    let negative = value < 0;
    if (negative) value = -value;

    // initial guess at solution
    let x;
    if (value < this.f)
      // use linear approximation in the quasi linear region
      x = this.x1 + value / this.taylor[0];
    // otherwise use ordinary logarithm
    else x = Math.log(value / this.a) / this.b;

    // try for let precision unless in extended range
    let tolerance = 3 * this.EPSILON;
    if (x > 1) tolerance = 3 * x * this.EPSILON;

    for (let i = 0; i < 20; ++i) {
      // compute the function and its first two derivatives
      let ae2bx = this.a * Math.exp(this.b * x);
      let ce2mdx = this.c / Math.exp(this.d * x);
      let y;
      if (x < this.xTaylor)
        // near zero use the Taylor series
        y = this.seriesBiexponential(x) - value;
      // this formulation has better roundoff behavior
      else y = ae2bx + this.f - (ce2mdx + value);
      let abe2bx = this.b * ae2bx;
      let cde2mdx = this.d * ce2mdx;
      let dy = abe2bx + cde2mdx;
      let ddy = this.b * abe2bx - this.d * cde2mdx;

      // this is Halley's method with cubic convergence
      let delta = y / (dy * (1 - (y * ddy) / (2 * dy * dy)));
      x -= delta;

      // if we've reached the desired precision we're done
      if (Math.abs(delta) < tolerance) {
        // handle negative arguments
        if (negative) return 2 * this.x1 - x;
        else return x;
      }
    }

    throw Error("DidNotConverge: scale() didn't converge");
  }

  inverse(scale: number) {
    // reflect negative scale regions
    let negative = scale < this.x1;
    if (negative) scale = 2 * this.x1 - scale;

    // compute the biexponential
    let inverse;
    if (scale < this.xTaylor)
      // near x1, i.e., data zero use the series expansion
      inverse = this.seriesBiexponential(scale);
    // this formulation has better roundoff behavior
    else
      inverse =
        this.a * Math.exp(this.b * scale) +
        this.f -
        this.c / Math.exp(this.d * scale);

    // handle scale for negative values
    if (negative) return -inverse;
    else return inverse;
  }

  dynamicRange() {
    return this.slope(1) / this.slope(this.x1);
  }
}

export default Logicle;
