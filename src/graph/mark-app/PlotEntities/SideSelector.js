import { MenuItem, Select, Tooltip } from "@material-ui/core";

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
        padding: 15,
      }}
    >
      <div>
        <div
          className="pc-y"
          style={{
            transform: "rotate(270deg)",
            marginLeft: "-145px",
            marginRight: "-80px",
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
                width: props.plot.width * 0.6,
                marginLeft: "35px",
                marginTop: "75px",
                marginRight: "-10px",
                marginBottom: "25px",
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
              width: props.plot.width * 0.35,
              marginLeft: "25px",
              marginTop: "60px",
              marginBottom: "10px",
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
    </div>
  );
}

export default SideSelector;
