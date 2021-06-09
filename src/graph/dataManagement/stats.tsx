import PlotData from "./plotData";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";

export default class PlotStats {
  plot: PlotData;

  getPlotStats(plot: PlotData, statsX: number, statsY: number) {
    this.plot = plot;
    const stat = this.getStats(statsX, statsY);
    const pop = this.getPopulationStats();
    return {
      statX: stat.x,
      statY: stat.y,
      filePopulationSize: pop.fileSize,
      gatedFilePopulationSize: pop.plotSize,
      gatedFilePopulationPercentage: pop.percentage,
    };
  }

  private getStats(statX: number, statY: number)
  {
    const data = this.plot.getXandYData();
    let x = this.getMedianOrMean(statX, data.xAxis);
    let y = this.getMedianOrMean(statY, data.yAxis);
    return { x: x, y: y};
  }

  private getMedianOrMean(val: number, axis: Array<number>)
  {
    switch(val)
    {
      case COMMON_CONSTANTS.DROPDOWNS.STATS.Mean:
          return this.getMean(axis);
      case COMMON_CONSTANTS.DROPDOWNS.STATS.Median:
          return this.getMedianValue(axis);
    }
  }

  private getPopulationStats() {
    const plotSize = this.plot.getXandYData().xAxis.length;
    const fileSize = this.plot.file.data.length;
    let percentage: number | string = 100 * (plotSize / fileSize);
    if (percentage < 1) {
      percentage = " < 1%";
    } else {
      percentage = percentage.toFixed(2) + " %";
    }
    return {
      percentage: percentage,
      fileSize: fileSize,
      plotSize: plotSize,
    };
  }

  private getMean(axis: Array<number>) {
    let sum = 0;
    axis.forEach((e) => (sum += e));
    let count = axis.length;
    return  this.parseNum(sum / count);
  }

  private parseNum = (num: number) => {
    if (num > 1e6 || num < 1e-6) {
      return num.toExponential();
    }
    if (num < 1) {
      return num.toFixed(6);
    }
    if (num > 1) {
      return num.toFixed(2);
    }
  };

  private getMedianValue(axis: Array<number>)
  {
    let axisSort = axis.sort((a,b)=>{
          return a-b;
    });

    let length = axisSort.length;
    let n = Math.floor((length/2) - 1);
    if(length % 2 == 0)
    {
      return this.parseNum(((axisSort[n]+axisSort[n+1])/2));
    }
    else
    {
      return this.parseNum(axisSort[n]);
    }
  }
}
