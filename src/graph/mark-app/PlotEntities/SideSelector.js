import { MenuItem, Select } from "@material-ui/core";

function SideSelector(props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: 15,
      }}
    >
      <div>
        <div
          className="pc-y"
          style={{
            marginRight: "20px",
            transform: "rotate(270deg)",
            marginLeft: "-53px",
            marginRight: "-60px",
            width: "min-content",
            display: "flex",
          }}
        >
          <Select
            disabled={props.plot.plotType == "histogram"}
            disableUnderline
            style={{
              // maxWidth: 100,
              marginTop: "10px",
              flex: "1 1 auto",
            }}
            onChange={(e) => {
              props.onChange(
                { value: e.target.value },
                "y",
                props.plotIndex.split("-")[1]
              );
            }}
            value={props.plot.yAxisIndex}
          >
            {props.channelOptions.map((e) => (
              <MenuItem key={e.value} value={e.value}>
                {e.label}
              </MenuItem>
            ))}
          </Select>
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
        {props.canvasComponent}
        <div
          style={{
            display: "flex",
          }}
        >
          <Select
            disableUnderline
            style={{
              maxWidth: 100,
              marginTop: "10px",
              flex: "1 1 auto",
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
