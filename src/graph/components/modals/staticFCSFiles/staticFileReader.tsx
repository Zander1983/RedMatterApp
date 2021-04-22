import FCSFile from "graph/dataManagement/fcsFile";

const kmeans = require("node-kmeans");

/* Frontend kmeans is very expensive, don't use */
const kmeansify = (list: Array<Array<number>>, callback: Function): void => {
  kmeans.clusterize(list, { k: 1200 }, (err: any, res: any) => {
    if (err) throw Error("Clusterization failed!");
    else {
      callback(res.map((e: any) => e.centroid));
    }
  });
};

export default (filename: string): FCSFile => {
  const file = require("./" + filename).default;

  if (file.axes.length * file.data.length > 10000) {
    // should run kmeans
  }

  return new FCSFile({
    name: filename,
    src: "local",
    axes: file.axes.map((e: any) => e.value),
    data: file.data,
    plotTypes: file.axes.map((e: any) => e.display),
  });
};
