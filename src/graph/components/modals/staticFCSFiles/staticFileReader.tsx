import FCSFile from "graph/dataManagement/fcsFile";

const staticFileReader = (filename: string): FCSFile => {
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

export default staticFileReader;
