import React, { ReactNode, useEffect, useState } from "react";
import {
  Divider,
  MenuItem,
  Select,
  CircularProgress,
  FormControl,
  Tooltip,
} from "@material-ui/core";

function SideSelector(props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <div>
        <div
          className="pc-y"
          style={{
            marginRight: "20px",
            transform: "rotate(270deg)",
            marginLeft: "-70px",
            marginRight: "-45px",
            width: "min-content",
            display: "flex",
          }}
        >
          <Select
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
              <MenuItem value={e.value}>{e.label}</MenuItem>
            ))}
          </Select>
          <Select
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
          }}
        >
          <Select
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
            value={props.xAxisIndex}
          >
            {props.options.map((e) => (
              <MenuItem name={e.label} value={e.value}>
                {e.label}
              </MenuItem>
            ))}
          </Select>
          <Select
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
          </Select>
        </div>
      </div>
    </div>
  );
}

export default SideSelector;
