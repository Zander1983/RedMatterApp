import PlotData from "./plotData";
import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import dataManager from "../dataManagement/dataManager";
import numeral from "numeral";

export default class PlotStats {
  plot: PlotData;

  getPlotStats(plot: PlotData, statsX: number, statsY: number) {
    this.plot = plot;
    const stat = this.getStats(statsX, statsY);
    const pointsOutSideOfRangeObj = this.getPointsOutOfRange();
    const pop = this.getPopulationStats();
    return {
      statX: stat.x,
      statY: stat.y,
      pointsOutSideOfRangeObj: pointsOutSideOfRangeObj,
      filePopulationSize: pop.fileSize,
      gatedFilePopulationSize: pop.plotSize,
      gatedFilePopulationPercentage: pop.percentage,
    };
  }

  getPointsOutOfRange()
  {
    let xyRange = this.plot.getXandYRanges();
    let xRange = xyRange.x;
    let yRange = xyRange.y;

    let xMin = xRange[0];
    let xMax = xRange[1];
    let yMin = yRange[0];
    let yMax = yRange[1];

    let data = this.plot.getXandYData();
    
    let length = Object.keys(data.xAxis).length;

    let count = 0;

    for(let i=0; i<length ; i++)
    {
      let x = data.xAxis[i];
      let y = data.yAxis[i];

      if(x < xMin || x > xMax || y < yMin || y > yMax)
      {
        count++;
      }
    }
    return { count: count, percentage: count ? this.parseNum(((count/length)*100)) : 0 }
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
    return  numeral(this.parseNum(sum / count)).format("0a");
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
    let n = Math.floor(length/2);
    let value;
    
    if(length % 2 == 0)
    {
       value = this.parseNum(((axisSort[n]+axisSort[n-1])/2));
    }
    else
    {
       value = this.parseNum(axisSort[n]);
    }
    
    return numeral(value).format("0a");
  }
}
