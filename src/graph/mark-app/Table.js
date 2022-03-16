import Plot from "./Plot";
import Histogram from "./Histogram";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";

function Table(props) {
  let controlEnrichedFile = props.enrichedFiles.find(
    (enrichedFile) => enrichedFile.isControlFile
  );

  let nonControlEnrichedFiles = props.enrichedFiles.filter(
    (enrichedFile) => !enrichedFile.isControlFile
  );

  //console.log("NON CONTROLS FILES ");
  //console.log(nonControlEnrichedFiles);

  return (
    <div>
      <div
        style={{
          color: "#fff",
          backgroundColor: "#66ccff",
          fontWeight: "bold",
          display: "flex",
          paddingLeft: "10px",
        }}
      >
        <div
          style={{
            width: "20%",
            order: 1,
          }}
        >
          PIPELINE 1
        </div>
        <div
          style={{
            width: "60%",
            order: 2,
            textAlign: "center",
          }}
        >
          CONTROL FILE
        </div>
        <div
          style={{
            width: "20%",
            order: 3,
          }}
        ></div>
      </div>
      <table className="workspace">
        <tbody style={{ width: "100%" }}>
          <tr>
            {controlEnrichedFile?.plots?.map((plot, plotIindex) => {
              return (
                <th key={`td-${plotIindex}`}>
                  <div
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {controlEnrichedFile.label}
                  </div>
                  {(() => {
                    if (plot?.plotType === "scatter") {
                      return (
                        <Plot
                          key={`plot-${plotIindex}`}
                          plot={plot}
                          enrichedFile={controlEnrichedFile}
                          onAddGate={props.onAddGate}
                          onDeleteGate={props.onDeleteGate}
                          onEditGate={props.onEditGate}
                          onResize={props.onResize}
                          onChangeChannel={props.onChangeChannel}
                          plotIndex={`0-${plotIindex}`}
                          testParam={props.testParam}
                        />
                      );
                    } else if (plot?.plotType === "histogram") {
                      return (
                        <Histogram
                          key={`plot-${plotIindex}`}
                          plot={plot}
                          onChangeChannel={props.onChangeChannel}
                          // onDeleteGate={props.onDeleteGate}
                          enrichedFile={controlEnrichedFile}
                          plotIndex={`0-${plotIindex}`}
                        />
                      );
                    }
                  })()}
                </th>
              );
            })}
          </tr>
        </tbody>
      </table>
      <div
        style={{
          color: "#000",
          backgroundColor: "#ffff99",
          border: "1px solid #000",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        OTHER FILES
      </div>
      <table>
        <tbody>
          <tr
            style={{
              border: "1px solid #32a1ce",
            }}
          >
            {controlEnrichedFile.plots.map((plot, plotIindex) => {
              return (
                <td
                  key={`td-population-sorter-${plotIindex}`}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "10px",
                        backgroundColor: `${
                          plotIindex > 0
                            ? controlEnrichedFile.plots[plotIindex - 1].gate
                                .color
                            : "#000000"
                        }`,
                        width: "15px",
                        height: "15px",
                      }}
                    ></div>
                    <div>
                      {plot.population}
                      <img
                        onClick={() => {
                          props.sortByGate(plot.population, "asc");
                        }}
                        src={downArrow}
                        alt="down-arrow"
                        style={{
                          width: 10,
                          marginLeft: 5,
                          cursor: "pointer",
                        }}
                      />
                      <img
                        onClick={() => {
                          props.sortByGate(plot.population, "dsc");
                        }}
                        src={upArrow}
                        alt="up-arrow"
                        style={{
                          width: 10,
                          marginLeft: 5,
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </div>
                </td>
              );
            })}
          </tr>
          {nonControlEnrichedFiles.map((enrichedFile, fileIndex) => {
            // LOOPING THROUGH NON-CONTROL FILES
            return (
              <tr
                key={`tr-${fileIndex}`}
                style={{
                  border: "4px solid #32a1ce",
                }}
              >
                {enrichedFile.plots.map((plot, plotIindex) => {
                  return (
                    <td key={`td-${plotIindex + 1}`}>
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {plot.population != "All"
                          ? `${enrichedFile.gateStats
                              .filter((gateStat) => {
                                return gateStat.gateName == plot.population;
                              })
                              .map((gateStat) => {
                                return gateStat && gateStat.percentage;
                              })}%`
                          : enrichedFile.label}
                      </div>
                      {(() => {
                        if (plot.plotType === "scatter") {
                          return (
                            <Plot
                              key={`plot-${plotIindex + 1}`}
                              plot={plot}
                              enrichedFile={enrichedFile}
                              onAddGate={props.onAddGate}
                              onEditGate={props.onEditGate}
                              onResize={props.onResize}
                              onChangeChannel={props.onChangeChannel}
                              plotIndex={`${fileIndex + 1}-${plotIindex}`}
                              testParam={props.testParam}
                            />
                          );
                        } else if (plot.plotType === "histogram") {
                          return (
                            <Histogram
                              key={`plot-${plotIindex + 1}`}
                              plot={plot}
                              onChangeChannel={props.onChangeChannel}
                              enrichedFile={enrichedFile}
                              plotIndex={`${fileIndex + 1}-${plotIindex}`}
                            />
                          );
                        }
                      })()}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
