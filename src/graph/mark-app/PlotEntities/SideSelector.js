import { MenuItem, Select } from "@material-ui/core";
import resizeIcon from "../../../assets/images/resize-icon.png";

function SideSelector(props) {
  return (
    <div
      style={{
        display: "flex",
      }}
      key={Math.random()}
    >
      <div
        className="pc-y"
        style={{
          marginRight: "20px",
          transform: "rotate(270deg)",
          marginLeft: "-70px",
          marginRight: "-45px",
          width: "min-content",
          display: "flex",
          width: 147,
        }}
        key={Math.random()}
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
              "y",
              props.plotIndex.split("-")[1]
            );
          }}
          value={props.yAxisIndex}
        >
          {props.options.map((e) => (
            <MenuItem key={e.value} value={e.value}>
              {e.label}
            </MenuItem>
          ))}
        </Select>
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
        key={Math.random()}
      >
        {props.canvasComponent}
        <div
          style={{
            display: "flex",
          }}
        >
          <Select
            style={{
              maxWidth: 100,
              flex: "1 1 auto",
            }}
            disableUnderline
            onChange={(e) => {
              props.onChange(
                { value: e.target.value },
                "x",
                props.plotIndex.split("-")[1]
              );
            }}
            value={props.xAxisIndex}
          >
            {props.options.map((e) => (
              <MenuItem key={e.value} name={e.label} value={e.value}>
                {e.label}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      <div
      // style={{
      //   display: "flex",
      //   alignItems: "flex-end",
      // }}
      // onMouseDown={(e) => {
      //   let nativeEvent = e.nativeEvent;
      //   props.handleResizeMouseDown(nativeEvent);
      // }}
      // onMouseMove={(e) => {
      //   let nativeEvent = e.nativeEvent;
      //   props.handleResizeMouseMove(nativeEvent);
      // }}
      // onMouseUp={(e) => {
      //   let nativeEvent = e.nativeEvent;
      //   props.handleResizeMouseUp(nativeEvent);
      // }}
      >
        {/* <img
          src={resizeIcon}
          alt="Logo"
          height="23"
          // style={{
          //   marginRight: 7,
          //   marginTop: -6,
          // }}
          onMouseDown={(e) => {
            let nativeEvent = e.nativeEvent;
            props.handleResizeMouseDown(nativeEvent);
          }}
          onMouseMove={(e) => {
            let nativeEvent = e.nativeEvent;
            props.handleResizeMouseMove(nativeEvent);
          }}
          onMouseUp={(e) => {
            let nativeEvent = e.nativeEvent;
            props.handleResizeMouseUp(nativeEvent);
          }}
        /> */}
      </div>
    </div>
  );
}

export default SideSelector;
