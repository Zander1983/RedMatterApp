import { MenuItem, Select, Tooltip } from "@material-ui/core";
import deleteIcon from "./../../../assets/images/delete.png";
import cameraIcon from "./../../../assets/images/camera.png";
import { getPointColors } from "graph/resources/plots";

function SideSelector(props) {
  const getYAxisValue = () => {
    if (props.plot.plotType == "histogram") {
      return "histogram";
    }
    return props.plot.yAxisIndex;
  };

  const getOverlayColor = (id) => {
    let color = props.plot?.overlays?.find((y) => y.id == id)?.color;
    if (color) return color;
    else return "transparent";
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        paddingLeft: 15,
        paddingBottom: 15,
        paddingRight: 15,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "60px",
          justifyContent: "center",
        }}
      >
        <div
          className="pc-y"
          style={{
            transform: "rotate(270deg)",
            marginLeft: "-90px",
            marginRight: "-80px",
            marginBottom: "15px",
            width: "min-content",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Tooltip
            title={
              props.plot.yAxisLabel.length > 20 ? props.plot.yAxisLabel : ""
            }
          >
            <Select
              disableUnderline
              style={{
                width: props.plot.height * 0.6,
                textAlign: "center",
                flex: "1 1 auto",
                fontSize: 12,
              }}
              onChange={(e) => {
                props.onChange(
                  { value: e.target.value },
                  "y",
                  props.plotIndex.split("-")[1]
                );
              }}
              value={getYAxisValue()}
            >
              {props.channelOptions.map((e) => (
                <MenuItem key={e.value} value={e.value}>
                  {e.label}
                </MenuItem>
              ))}
              <MenuItem
                style={{
                  backgroundColor: `${
                    props.plot.plotType == "histogram"
                      ? "rgb(236 235 235)"
                      : "unset"
                  }`,
                }}
                key={`${props.plotIndex}-hist`}
                value="histogram"
              >
                Histogram{" "}
              </MenuItem>
            </Select>
          </Tooltip>
          <Select
            disableUnderline
            style={{
              width: props.plot.height * 0.35,
              textAlign: "center",
              flex: "1 1 auto",
              fontSize: 12,
            }}
            value={props.plot.yScaleType}
            onChange={(e) =>
              props.onChangeScale(
                { scale: e.target.value },
                "y",
                props.plotIndex.split("-")[1]
              )
            }
          >
            <MenuItem value={"lin"}>Linear</MenuItem>
            <MenuItem value={"bi"}>Logicle</MenuItem>
          </Select>
        </div>
      </div>
      <div
        className="pc-x"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingRight: 0,
        }}
      >
        {/* canvas-top-bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            marginTop: 5,
            marginBottom: 10,
          }}
        >
          {/* <img
            src={cameraIcon}
            alt={props.plot.id}
            style={{
              width: 15,
              height: 15,
              cursor: "pointer",
            }}
            onClick={() =>
              props.downloadPlotAsImage(props.plot, props.plotIndex)
            }
          /> */}
          {props.plot.gate && props.onDeleteGate && (
            <img
              src={deleteIcon}
              alt={props.plot.id}
              style={{
                width: 15,
                height: 15,
                marginLeft: 30,
                cursor: "pointer",
              }}
              onClick={() => props.onDeleteGate(props.plot)}
            />
          )}
        </div>
        {props.canvasComponent}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: props.plot.width,
          }}
        >
          <Tooltip
            title={
              props.plot.xAxisLabel.length > 20 ? props.plot.xAxisLabel : ""
            }
          >
            <Select
              disableUnderline
              style={{
                width: props.plot.width * 0.6,
                textAlign: "center",
                flex: "1 1 auto",
                fontSize: 12,
              }}
              onChange={(e) => {
                props.onChange(
                  { value: e.target.value },
                  "x",
                  props.plotIndex.split("-")[1]
                );
              }}
              value={props.plot.xAxisIndex}
            >
              {props.channelOptions.map((e) => (
                <MenuItem key={e.value} name={e.label} value={e.value}>
                  {e.label}
                </MenuItem>
              ))}
            </Select>
          </Tooltip>
          <Select
            disableUnderline
            style={{
              textAlign: "center",
              flex: "1 1 auto",
              fontSize: 12,
              width: props.plot.width * 0.35,
            }}
            value={props.plot.xScaleType}
            onChange={(e) =>
              props.onChangeScale(
                { scale: e.target.value },
                "x",
                props.plotIndex.split("-")[1]
              )
            }
          >
            <MenuItem value={"lin"}>Linear</MenuItem>
            <MenuItem value={"bi"}>Logicle</MenuItem>
          </Select>
        </div>
      </div>

      {props.plot.plotType == "histogram" ? (
        <div
          style={{
            marginLeft: "10px",
            marginTop: "30px",
            height: "fit-content",
            padding: "5px",
          }}
        >
          <Select
            disableUnderline
            multiple
            style={{
              textAlign: "center",
              flex: "1 1 auto",
              fontSize: 12,
              width: 100,
            }}
            value={[""]}
          >
            <MenuItem value="">Overlays</MenuItem>
            {props.allFileMinObj
              .filter((x) => x.id != props.enrichedFile.fileId)
              .map((x) => {
                return (
                  <MenuItem key={x?.id}>
                    <div
                      class="form-check"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 5,
                        backgroundColor: getOverlayColor(x.id),
                      }}
                    >
                      <input
                        class="form-check-input"
                        type="checkbox"
                        value={x.id}
                        checked={
                          props.plot?.overlays?.find((y) => y.id == x.id)
                            ? true
                            : false
                        }
                        onClick={(e) => {
                          props.addOverlay(
                            props.enrichedFile.fileId,
                            e.target.value,
                            props.plotIndex.split("-")[1],
                            e.target.checked
                          );
                        }}
                        id={props.plotIndex + x.id}
                      ></input>
                      <label
                        class="form-check-label"
                        style={{ wordBreak: "break-all", marginLeft: 3 }}
                        for={props.plotIndex + x.id}
                      >
                        {`${
                          x.name.length > 50
                            ? x.name.substring(0, 50) + "..."
                            : x.name
                        }`}
                      </label>
                    </div>
                  </MenuItem>
                );
              })}
          </Select>
          <div
            style={{
              height: 180,
              overflowY: "auto",
              maxWidth: 230,
            }}
          >
            {props.plot?.overlays?.map((x) => {
              return (
                <div style={{ alignItems: "center", display: "flex" }}>
                  <div
                    style={{
                      userSelect: "none",
                      backgroundColor: x.color,
                      width: 15,
                      height: 15,
                      color: "transparent",
                    }}
                  >
                    df
                  </div>
                  <div style={{ marginLeft: 5 }}>
                    {props.allFileMinObj.find((y) => y.id == x.id).name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SideSelector;
