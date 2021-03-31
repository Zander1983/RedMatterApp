/*
  About the challange:
    There are many magic numbers floating around here. As this is a code
    challange, I've not taken the proper care to make the code beautiful,
    my objective was solely to fullfill the challange here.
*/

export const circle = (ctx: any, x: any, y: any, r: any, color: any) => {
  const oldcolor = ctx.fillStyle;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = oldcolor;
};

export const line = (ctx: any, x1: any, y1: any, x2: any, y2: any) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

export const text = (ctx: any, params: any) => {
  const { font, text, x, y } = params;
  if (params.style !== undefined) {
    ctx.fillStyle = params.style;
  }
  ctx.font = font;
  ctx.fillText(text, x, y);
};

export const graphLine = (ctx: any, params: any) => {
  const { x1, y1, x2, y2, ib, ie } = params;

  // Draw line
  ctx.lineWidth = 3;
  line(ctx, x1, y1, x2, y2);

  // Draw markings and text
  ctx.lineWidth = 2;
  let counter = 10;

  if (x1 === x2) {
    let interval = Math.max(y1, y2) - Math.min(y1, y2);
    interval /= 10;
    for (let y = Math.min(y1, y2); y < Math.max(y1, y2); y += interval) {
      line(ctx, x1 - 7, y, x1 + 7, y);
      let text_write = ((Math.abs(ib - ie) / 10) * counter).toString();
      if (text_write.length > 6) text_write = text_write.substring(0, 6);
      text(ctx, {
        font: "Arial black 30px",
        style: "black",
        text: text_write,
        x: x1 - 45,
        y: y + 4,
      });
      counter--;
    }
  } else if (y1 === y2) {
    let interval = Math.max(x1, x2) - Math.min(x1, x2);
    interval /= 10;
    for (let x = Math.max(x1, x2); x > Math.min(x1, x2); x -= interval) {
      line(ctx, x, y1 - 7, x, y1 + 7);
      let text_write = ((Math.abs(ib - ie) / 10) * counter).toString();
      if (text_write.length > 6) text_write = text_write.substring(0, 6);
      text(ctx, {
        font: "Arial black 30px",
        style: "black",
        text: text_write,
        x: x - 12,
        y: y1 + 20,
      });
      counter--;
    }
  } else {
    throw new Error("Plot line is not vertical nor horizontal");
  }
};

const plotCanvasWidth = (params: any) => {
  return Math.max(params.y1, params.y2) - Math.min(params.y1, params.y2);
};
const plotCanvasHeight = (params: any) => {
  return Math.max(params.y1, params.y2) - Math.min(params.y1, params.y2);
};

const convertToPlotCanvasPoint = (x: any, y: any, params: any) => {
  const w = plotCanvasWidth(params);
  const h = plotCanvasHeight(params);
  return [
    (x / (params.iex - params.ibx)) * w + Math.min(params.x1, params.x2),
    ((params.iey - params.iby - y) / (params.iey - params.iby)) * h +
      Math.min(params.y1, params.y2),
  ];
};

export const createPlotGraph = (ctx: any, params: any) => {
  const { x1, x2, y1, y2, ibx, iex, iby, iey } = params;
  ctx.strokeStyle = "#000";
  graphLine(ctx, {
    x1: x1,
    y1: y1,
    x2: x1,
    y2: y2,
    ib: ibx,
    ie: iex,
  });

  graphLine(ctx, {
    x1: x1,
    y1: y2,
    x2: x2,
    y2: y2,
    ib: iby,
    ie: iey,
  });

  ctx.strokeStyle = "#bababa";

  ctx.fillStyle = "black";
  ctx.fillRect(x1, y1 - 8, x2, y2);
  // Horizontal plot lines
  // for (let i = 0; i < 10; i++) {
  //     ctx.lineWidth = 1
  //     const height = (Math.abs(y1 - y2) / 10) * i + Math.min(y1, y2)
  //     line(ctx, x1, height, x2, height)
  // }
  // // Vertical plot lines
  // for (let i = 1; i <= 10; i++) {
  //     ctx.lineWidth = 1
  //     const width = (Math.abs(x1 - x2) / 10) * i + Math.min(x1, x2)
  //     line(ctx, width, y1, width, y2)
  // }

  return ((ctx: any, params: any) => {
    return {
      addPoint: (x: any, y: any, color: any = "#888") => {
        if (x < params.ibx || x > params.iex) return;
        if (y < params.iby || y > params.iey) return;
        const plotPoints = convertToPlotCanvasPoint(x, y, params);
        const plotx = plotPoints[0];
        const ploty = plotPoints[1];
        circle(ctx, plotx, ploty, 1, color);
      },
      addPolygon: (polygon: any, color: any = "#00d") => {
        ctx.strokeStyle = color;
        const pl = polygon.length;
        for (let i = 0; i < pl; i++) {
          const a = convertToPlotCanvasPoint(
            polygon[i][0],
            polygon[i][1],
            params
          );
          const b = convertToPlotCanvasPoint(
            polygon[(i + 1) % pl][0],
            polygon[(i + 1) % pl][1],
            params
          );
          line(ctx, a[0], a[1], b[0], b[1]);
        }
      },
      addLine: (pa: any, pb: any, color: any = "#0d0") => {
        ctx.strokeStyle = color;
        const a = convertToPlotCanvasPoint(pa[0], pa[1], params);
        const b = convertToPlotCanvasPoint(pb[0], pb[1], params);
        line(ctx, a[0], a[1], b[0], b[1]);
      },
    };
  })(ctx, params);
};
