import Plot from "./Plot";
import Histogram from "./Histogram";
import { useState } from "react";
import Draggable from "react-draggable";

const ShowAllPlots = (props) => {
  const [plots, setPlots] = useState(props.plots);
  let allFileMinObj = props.enrichedFiles.map((enrichedFile) => {
    return { id: enrichedFile.fileId, name: enrichedFile.label };
  });

  return (
    <>
      <div
        style={{
          color: "#fff",
          backgroundColor: "#66ccff",
          fontWeight: "bold",
          display: "flex",
          paddingLeft: "10px",
          marginTop: 30,
        }}
      >
        All Files
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "90%",
          flexWrap: "wrap",
          marginLeft: "5%",
        }}
      >
        {plots?.map((plot, plotIndex) => {
          if (plot?.plot?.plotType === "scatter")
            return (
              <Draggable key={`plot-${plotIndex}`}>
                <div style={{ cursor: "move" }}>
                  <Plot
                    key={`plot-${plotIndex + 1}`}
                    plot={plot?.plot}
                    enrichedFile={props.enrichedFiles.find(
                      (file) => file.fileId === plot?.fileId
                    )}
                    onAddGate={props.onAddGate}
                    onEditGate={props.onEditGate}
                    onResize={props.onResize}
                    onChangeChannel={props.onChangeChannel}
                    plotIndex={`${plotIndex}`}
                    downloadPlotAsImage={props.downloadPlotAsImage}
                  />
                </div>
              </Draggable>
            );
          else if (plot?.plot?.plotType === "histogram") {
            let enrichedOverlayFiles;
            if (plot?.plot?.overlays && plot?.plot?.overlays.length > 0) {
              enrichedOverlayFiles = props.enrichedFiles.filter(
                (enrichedFile) => {
                  return (
                    plot.overlays.findIndex(
                      (x) => x.id == enrichedFile.fileId
                    ) > -1
                  );
                }
              );
            }
            return (
              <Draggable key={`plot-${plotIndex}`}>
                <div style={{ cursor: "move" }}>
                  <Histogram
                    key={`plot-${plotIndex}`}
                    plot={plot?.plot}
                    onChangeChannel={props.onChangeChannel}
                    onAddGate={props.onAddGate}
                    addOverlay={props.addOverlay}
                    onDeleteGate={props.onDeleteGate}
                    onEditGate={props.onEditGate}
                    enrichedFile={
                      props.enrichedFiles[
                        parseInt(plotIndex / props.enrichedFiles.length)
                      ]
                    }
                    enrichedOverlayFiles={enrichedOverlayFiles}
                    allFileMinObj={allFileMinObj}
                    plotIndex={`${plotIndex}`}
                    downloadPlotAsImage={props.downloadPlotAsImage}
                  />
                </div>
              </Draggable>
            );
          }
        })}
      </div>
    </>
  );
};
export default ShowAllPlots;
