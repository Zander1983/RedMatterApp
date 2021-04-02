  setLastMousePos(lastMousePos: { x: number; y: number }) {
    this.lastMousePos = lastMousePos;
  }

  ovalGate: OvalGate;

  ovalGateState: {
    center: Point | null;
    primaryP1: Point | null;
    primaryP2: Point | number;
    secondaryP1: Point | null;
    secondaryP2: Point | null;
    ang: number | null;
  } | null = null;
  lastMousePos: Point;

  drawOvalGate(
    gate:
      | OvalGate
      | {
          center: Point;
          primaryP1: Point;
          primaryP2: Point;
          secondaryP1: Point;
          secondaryP2: Point;
        }
  ) {
    const c = this.convertToPlotPoint(gate.center.x, gate.center.y);
    const p1 = this.convertToPlotPoint(gate.primaryP1.x, gate.primaryP1.y);
    const p2 = this.convertToPlotPoint(gate.primaryP2.x, gate.primaryP2.y);
    const s1 = this.convertToPlotPoint(gate.secondaryP1.x, gate.secondaryP1.y);
    const s2 = this.convertToPlotPoint(gate.secondaryP2.x, gate.secondaryP2.y);

    const d1 = euclidianDistance2D(p1, p2);
    const d2 = euclidianDistance2D(s1, s2);

    const ang = getVectorAngle2D(p1, p2);

    this.drawer.oval({
      x: c.x,
      y: c.y,
      d1: d1 / 2,
      d2: d2 / 2,
      ang: ang,
    });
  }

  setOvalGateState(state: {
    center: Point | null;
    primaryP1: Point | null;
    primaryP2: Point | number;
    secondaryP1: Point | null;
    secondaryP2: Point | null;
    ang: number;
  }) {
    console.log("=== oval gate state has been set ===");
    this.ovalGateState = state;
  }

  unsetOvalGate() {
    this.ovalGateState = null;
  }

  drawOvalGating(context: any, plotGraph: any) {
    if (
      this.ovalGateState.primaryP1 != null &&
      this.ovalGateState.secondaryP1 != null
    ) {
      //@ts-ignore
      this.drawOvalGate(this.ovalGateState);
      this.drawer.scline({
        x1: this.ovalGateState.center.x,
        y1: this.ovalGateState.center.y,
        x2: this.ovalGateState.primaryP1.x,
        y2: this.ovalGateState.primaryP1.y,
        lineWidth: 3,
        strokeColor: "#d00",
      });
      plotGraph.addPoint(
        this.ovalGateState.center.x,
        this.ovalGateState.center.y,
        "#00d"
      );
    } else if (this.ovalGateState.primaryP1 != null) {
      this.drawer.scline({
        x1: this.ovalGateState.primaryP1.x,
        y1: this.ovalGateState.primaryP1.y,
        x2: this.lastMousePos.x,
        y2: this.lastMousePos.y,
        lineWidth: 3,
        strokeColor: "#f00",
      });
    }
  }


    if (this.ovalGateState != null) {
      this.drawOvalGating(context, plotGraph);
    }

    for (const gate of this.gates) {
      if (
        gate instanceof OvalGate &&
        this.xAxisName == gate.xAxis &&
        this.yAxisName == gate.yAxis
      ) {
        this.drawOvalGate(gate);
      }
    }

        for (let i = 0; i < this.xAxis.length; i++) {
      let color = "#444";
      if (this.heatmap) {
        color = heatmapColors[i];
      }

      let validConcrete = this.gates.length > 0 ? true : false;
      for (let gate of this.gates) {
        if (!(gate instanceof OvalGate)) {
          continue;
        }
        const c = this.drawer.convertToPlotCanvasPoint(
          gate.center.x,
          gate.center.y
        );
        const p1 = this.drawer.convertToPlotCanvasPoint(
          gate.primaryP1.x,
          gate.primaryP1.y
        );
        const p2 = this.drawer.convertToPlotCanvasPoint(
          gate.primaryP2.x,
          gate.primaryP2.y
        );
        const s1 = this.drawer.convertToPlotCanvasPoint(
          gate.secondaryP1.x,
          gate.secondaryP1.y
        );
        const s2 = this.drawer.convertToPlotCanvasPoint(
          gate.secondaryP2.x,
          gate.secondaryP2.y
        );
        const v = this.drawer.convertToPlotCanvasPoint(
          this.xAxis[i],
          this.yAxis[i]
        );
        const ang = getVectorAngle2D(p1, p2);

        if (
          !pointInsideEllipse(v, {
            center: c,
            primaryP1: p1,
            primaryP2: p2,
            secondaryP1: s1,
            secondaryP2: s2,
            ang: ang,
          })
        ) {
          validConcrete = false;
        }
      }

      let validAbstract = this.gates.length > 0 ? true : false;
      for (let gate of this.gates) {
        if (!(gate instanceof OvalGate)) {
          continue;
        }
        if (!gate.isPointInside({ x: this.xAxis[i], y: this.yAxis[i] })) {
          validAbstract = false;
        }
      }

            if (validConcrete && !validAbstract) color = "#44f";
      if (!validConcrete && validAbstract) color = "#4b4";
      if (validConcrete && validAbstract) color = "#f44";
      // if (validAbstract) color = "#44f";