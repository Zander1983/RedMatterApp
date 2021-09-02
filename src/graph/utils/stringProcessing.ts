import { AxisName } from "graph/process/types";

export const getFSCandSSCAxisOnAxesList = (
  axes: AxisName[]
): { fsc: AxisName; ssc: AxisName } => {
  let fscIndex: null | number = null;
  let sscIndex: null | number = null;
  for (
    let i = 0;
    i < axes.length && (fscIndex === null || sscIndex === null);
    i++
  ) {
    const axis = axes[i];
    if (axis.toUpperCase().indexOf("FSC") !== -1) {
      fscIndex = i;
    } else if (axis.toUpperCase().indexOf("SSC") !== -1) {
      sscIndex = i;
    }
  }
  if (sscIndex === null || fscIndex === null) {
    throw Error("FSC or SSC axis not found");
  }
  return { fsc: axes[fscIndex], ssc: axes[sscIndex] };
};
