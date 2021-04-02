  heatMapCache: Array<{ xAxis: string; yAxis: string; colors: string[] }> = [];

  getHeatmapColors() {
    for (const hm of this.heatMapCache) {
      const { xAxis, yAxis, colors } = hm;
      if (this.xAxisName == xAxis && this.yAxisName == yAxis) {
        return colors;
      }
    }
    const hmr = this.heatmappingRadius;

    // Returns how many points are close (within heatmapping percentage radius)
    // to a given point i
    const closePoints = (i: number) => {
      let count = 0;

      const x = this.xAxis[i];
      const y = this.yAxis[i];
      const xr = this.xRange[1] - this.xRange[0];
      const yr = this.yRange[1] - this.yRange[0];
      const pp1 = { x: x - hmr * xr, y: y };
      const pp2 = { x: x + hmr * xr, y: y };
      const sp1 = { x: x, y: y - hmr * yr };
      const sp2 = { x: x, y: y + hmr * yr };

      this.xAxis.forEach((e, j) => {
        if (
          j !== i &&
          pointInsideEllipse(
            { x: this.xAxis[j], y: this.yAxis[j] },
            {
              center: { x: x, y: y },
              primaryP1: pp1,
              primaryP2: pp2,
              secondaryP1: sp1,
              secondaryP2: sp2,
              ang: 0,
            }
          )
        ) {
          count++;
        }
      });
      return count;
    };
    const lp = Array(this.xAxis.length)
      .fill(0)
      .map((e, i) => closePoints(i));

    //@ts-ignore
    const mx = lp.reduce((a, c) => (a > c ? a : c), []);
    let cColors: string[] = lp.map((e) => {
      const p = -Math.pow(e / mx, 5) + 1;
      const blue = (150 - 50) * p + 50;
      const red = -(210 - 100) * p + 210;
      const green = 80;
      return `rgb(${red}, ${green}, ${blue})`;
    });
    for (let i = 0; i < this.xAxis.length; i++) {}
    this.heatMapCache.push({
      colors: cColors,
      xAxis: this.xAxisName,
      yAxis: this.yAxisName,
    });
    return cColors;
  }