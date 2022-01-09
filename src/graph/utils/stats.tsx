import { COMMON_CONSTANTS } from "assets/constants/commonConstants";
import numeral from "numeral";
import { sqrt } from "mathjs";
import { Plot, File, PopulationGateType } from "graph/resources/types";
import * as PlotResource from "graph/resources/plots";
import * as DatasetResource from "graph/resources/dataset";
import { getFile, getPopulation } from "./workspace";

export default class PlotStats {
  plot: Plot;
  file: File;

  getPlotStatsWithFiles(
    file: File,
    gates: PopulationGateType[],
    statsX: number,
    statsY: number,
    xAxis: string,
    yAxis: string
  ) {
    this.file = file;
    // const stat = this.getStatsWithFile(statsX, statsY, gates, xAxis, yAxis); // all good till now
    const pop = this.getPopulationStatsWithFile(gates, xAxis, yAxis);
    return {
      // statX: stat.x,
      // statY: stat.y,
      // filePopulationSize: pop.fileSize,
      // gatedFilePopulationSize: pop.plotSize,
      gatedFilePopulationPercentage: pop.percentage,
    };
  }

  getPlotStats(plot: Plot, statsX: number, statsY: number) {
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

  private getStats(statX: number, statY: number) {
    const data = PlotResource.getXandYData(this.plot);
    let x = this.getMedianOrMean(statX, data[0]);
    let y = this.getMedianOrMean(statY, data[1]);
    return { x: x, y: y };
  }

  private getStatsWithFile(
    statX: number,
    statY: number,
    gates: PopulationGateType[],
    xAxis: string,
    yAxis: string
  ) {
    const data = PlotResource.getXandYDataWithFiles(
      this.file,
      gates,
      xAxis,
      yAxis
    );
    let x = this.getMedianOrMean(statX, data[0]);
    let y = this.getMedianOrMean(statY, data[1]);
    return { x: x, y: y };
  }

  private getPopulationStatsWithFile(
    gates: PopulationGateType[],
    xAxis: string,
    yAxis: string
  ) {
    const plotSize = PlotResource.getXandYDataWithFiles(
      this.file,
      gates,
      xAxis,
      yAxis
    )[0].length;
    const fileSize = DatasetResource.getDataset(this.file.id)[this.file.axes[0]]
      .length;
    let percentage: number | string = 100 * (plotSize / fileSize);
    if (percentage < 1) {
      percentage = " < 1%";
    } else {
      percentage = percentage.toFixed(2) + " %";
    }
    return {
      percentage: percentage,
      // fileSize: fileSize,
      // plotSize: plotSize,
    };
  }

  private getMedianOrMean(val: number, axis: Float32Array) {
    switch (val) {
      case COMMON_CONSTANTS.DROPDOWNS.STATS.Mean:
        return this.getMean(axis);
      case COMMON_CONSTANTS.DROPDOWNS.STATS.Median:
        return this.getMedianValue(axis);
    }
  }

  private getPopulationStats() {
    const plotSize = PlotResource.getXandYData(this.plot)[0].length;
    const file = getFile(getPopulation(this.plot.population).file);
    const fileSize = DatasetResource.getDataset(file.id)[file.axes[0]].length;
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

  private getMean(axis: Float32Array) {
    let sum = 0;
    axis.forEach((e) => (sum += e));
    let count = axis.length;
    return numeral(this.parseNum(sum / count)).format("0a");
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

  private getMedianValue(axis: Float32Array) {
    let axisSort = axis.sort((a, b) => {
      return a - b;
    });

    let length = axisSort.length;
    let n = Math.floor(length / 2);
    let value;

    if (length % 2 === 0) {
      value = this.parseNum((axisSort[n] + axisSort[n - 1]) / 2);
    } else {
      value = this.parseNum(axisSort[n]);
    }

    return numeral(value).format("0a");
  }

  getPointsOutOfRange() {
    let xyRange = PlotResource.getXandYRanges(this.plot);
    let xRange = xyRange.x;
    let yRange = xyRange.y;

    let xMin = xRange[0];
    let xMax = xRange[1];
    let yMin = yRange[0];
    let yMax = yRange[1];

    let data = PlotResource.getXandYData(this.plot);

    let length = Object.keys(data[0]).length;

    let count = 0;

    for (let i = 0; i < length; i++) {
      let x = data[0][i];
      let y = data[1][i];

      if (x < xMin || x > xMax || y < yMin || y > yMax) {
        count++;
      }
    }
    return {
      count: count,
      percentage: count ? this.parseNum((count / length) * 100) : 0,
    };
  }
}
