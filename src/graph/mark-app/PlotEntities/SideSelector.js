import { MenuItem, Select, Tooltip } from "@material-ui/core";
import deleteIcon from "./../../../assets/images/delete.png";

function SideSelector(props) {
  const getYAxisValue = () => {
    if (props.plot.plotType == "histogram") {
      return "histogram";
    }
    return props.plot.yAxisIndex;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 15,
        paddingBottom: 15,
        paddingRight: 15,
      }}
    >
      <div>
        <div
          className="pc-y"
          style={{
            // marginRight: "20px",
            transform: "rotate(270deg)",
            marginLeft: "-115px",
            marginRight: "-60px",
            width: "min-content",
            display: "flex",
          }}
        >
          <Tooltip
            title={
              props.plot.yAxisLabel.length > 25 ? props.plot.yAxisLabel : ""
            }
          >
            <Select
              disableUnderline
              style={{
                width: 180,
                marginLeft: "25px",
                marginTop: "60px",
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
          {/* <Select
            style={{
              marginTop: "10px",
              marginLeft: 10,
              flex: "1 1 auto",
            }}
            value={props.yScaleType}
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
          </Select> */}
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
        {props.plot.gate && props.onDeleteGate ? (
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
            <img
              src={deleteIcon}
              alt={props.plot.id}
              style={{ width: 15, height: 15, cursor: "pointer" }}
              onClick={() => props.onDeleteGate(props.plot)}
            />
          </div>
        ) : (
          <div style={{ height: 30 }}> </div>
        )}
        {props.canvasComponent}
        <div
          style={{
            display: "flex",
          }}
        >
          <Tooltip
            title={
              props.plot.xAxisLabel.length > 25 ? props.plot.xAxisLabel : ""
            }
          >
            <Select
              disableUnderline
              style={{
                width: 180,
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
          {/* <Select
            style={{
              marginTop: "10px",
              marginLeft: 10,
              flex: "1 1 auto",
            }}
            value={props.xScaleType}
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
          </Select> */}
        </div>
      </div>
    </div>
  );
}

export default SideSelector;
