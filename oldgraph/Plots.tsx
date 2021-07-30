import React, { useEffect } from "react";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import "./react-grid-layout-styles.css";

// import dataManager from "./old/dataManagement/dataManager";
import PlotData from "graph/old/dataManagement/plotData";
import { Divider } from "@material-ui/core";
import useForceUpdate from "hooks/forceUpdate";
import Plot from "graph/renderers/plotRender";

const ResponsiveGridLayout = WidthProvider(Responsive);

const classes = {
  itemOuterDiv: {
    flex: 1,
    backgroundColor: "#eef",
    border: "solid 0.5px #bbb",
    boxShadow: "1px 3px 4px #bbd",
    borderRadius: 5,
  },
  itemInnerDiv: {
    width: "100%",
    height: "100%",
  },
};

const MINW = 10;
const MINH = 12;
const STDW = 10;

const standardGridPlotItem = (index: number, plotData: any) => {
  let x = plotData.positions.x;
  let y = plotData.positions.y;
  let w = plotData.dimensions.w;
  let h = plotData.dimensions.h;
  return {
    x: x < 0 ? (index * STDW) % 30 : x,
    y: y < 0 ? 100 : y,
    w: w,
    h: h,
    minW: MINW,
    minH: MINH,
    // static: true,
  };
};

interface WorkspaceProps {
  sharedWorkspace: boolean;
  experimentId: string;
}

const Plots = (props: WorkspaceProps) => {
  // const forceUpdate = useForceUpdate();
  // const [plots, setPlots] = React.useState([]);
  // const [plotMoving, setPlotMoving] = React.useState(true);
  // const updatePlotMovement = () => {
  //   setPlotMoving(!dataManager.dragLock);
  //   forceUpdate();
  // };
  // useEffect(() => {
  //   dataManager.addObserver("addNewPlotToWorkspace", () => update());
  //   dataManager.addObserver("removePlotFromWorkspace", () => update());
  //   dataManager.addObserver("updateWorkspace", () => update());
  //   dataManager.addObserver("workspaceDragLock", () => updatePlotMovement());
  //   update();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  // const update = () => {
  //   if (!dataManager.ready()) {
  //     setPlots([]);
  //     forceUpdate();
  //   }
  //   const plotMap = dataManager.getAllPlots();
  //   const plotList: {
  //     plotData: PlotData;
  //     plotRender: Plot;
  //   }[] = [];
  //   plotMap.forEach((v) =>
  //     plotList.push({
  //       plotData: v.plot,
  //       plotRender: dataManager.getPlotRendererForPlot(v.plotID),
  //     })
  //   );
  //   setPlots(plotList);
  //   forceUpdate();
  // };
  // const savePlotPosition = (layouts: any) => {
  //   for (let i = 0; i < layouts.length; i++) {
  //     let layout = layouts[i];
  //     let plotId = layouts[i].i;
  //     let plot = plots.find((x) => x.plotData.id === plotId);
  //     plot.plotData.dimensions = {
  //       h: layout.h,
  //       w: layout.w,
  //     };
  //     plot.plotData.positions = {
  //       x: layout.x,
  //       y: layout.y,
  //     };
  //     dataManager.workspaceUpdated();
  //   }
  // };
  // /* This function has to be carefully controlled ensure that the plots will
  //    not re re-rendered unecessarely, which could slow down app's perfomance
  //    significatively */
  // let plotGroups: any = {};
  // for (const plot of plots) {
  //   const fileId = plot.plotData.file.id;
  //   if (fileId in plotGroups) {
  //     plotGroups[fileId].push(plot);
  //   } else {
  //     plotGroups[fileId] = [plot];
  //   }
  // }
  // const keys = Object.keys(plotGroups);
  // //@ts-ignore
  // if (plots.length > 0) {
  //   return (
  //     <div>
  //       <Divider></Divider>
  //       {keys.map((key: string) => {
  //         const plots: {
  //           plotData: PlotData;
  //           plotRender: Plot;
  //         }[] = plotGroups[key];
  //         return (
  //           <div key={key}>
  //             <div
  //               style={{
  //                 backgroundColor: "#6666AA",
  //                 padding: 5,
  //                 paddingLeft: 10,
  //                 paddingBottom: 1,
  //                 paddingTop: 7,
  //               }}
  //             >
  //               <h1 style={{ color: "white" }}>
  //                 {plots[0].plotData.file.name}
  //               </h1>
  //             </div>
  //             <div style={{ marginTop: 10, marginBottom: 10 }}>
  //               <ResponsiveGridLayout
  //                 className="layout"
  //                 breakpoints={{ lg: 1200 }}
  //                 cols={{ lg: 30 }}
  //                 rows={{ lg: 30 }}
  //                 rowHeight={30}
  //                 isDraggable={plotMoving}
  //                 onLayoutChange={(layout: any) => {
  //                   savePlotPosition(layout);
  //                 }}
  //               >
  //                 {
  //                   //@ts-ignore
  //                   plots.map((e, i) => {
  //                     return (
  //                       <div
  //                         key={e.plotData.id}
  //                         style={classes.itemOuterDiv}
  //                         data-grid={standardGridPlotItem(i, e.plotData)}
  //                         id={`workspace-outter-${e.plotData.id}`}
  //                       >
  //                         <div id="inner" style={classes.itemInnerDiv}>
  //                           {/* <Plot
  //                             id={e.plotData.id}
  //                             plots={plots.filter(
  //                               (x) => x.plotData.id !== e.plotData.id
  //                             )}
  //                             sharedWorkspace={props.sharedWorkspace}
  //                             experimentId={props.experimentId}
  //                           /> */}
  //                         </div>
  //                       </div>
  //                     );
  //                   })
  //                 }
  //               </ResponsiveGridLayout>
  //             </div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // } else {
  //   return (
  //     <div
  //       style={{
  //         textAlign: "center",
  //       }}
  //     >
  //       <h3 style={{ marginTop: 100, marginBottom: 10 }}>
  //         Click on "Add new file" to visualize
  //       </h3>
  //       <h4 style={{ marginBottom: 90, color: "#777" }}>
  //         Here you may move around, gate, duplicate, delete or resize your plots
  //         as you see fit
  //       </h4>
  //     </div>
  //   );
  // }
};

export default Plots;
