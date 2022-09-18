import {
  MenuItem,
  Select,
  Tooltip,
  TextField,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
} from "@material-ui/core";
import deleteIcon from "./../../../assets/images/delete.png";
import cameraIcon from "./../../../assets/images/camera.png";
import Modal from "react-modal";
import { useState, useEffect } from "react";

function SideSelector(props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    setChannels(channels && channels.length > 0 ? channels : props.channels);
  }, [props.channels, channels]);

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

  const updateRanges = (rowI, minOrMax, newRange) => {
    setChannels((channels) => {
      let newChannels = channels.map(
        (channel, i) =>
          i === rowI
            ? { ...channel, [minOrMax]: newRange } // create a new object with "minumum" set to newRange if i === rowI
            : channel // if i !== rowI then don't update the currennt item at this index
      );

      return newChannels;
    });
  };

  // const handleClick = () => {
  //   if (!this.state.showModal) {
  //     document.addEventListener("click", this.handleOutsideClick, false);
  //   } else {
  //     document.removeEventListener("click", this.handleOutsideClick, false);
  //   }

  //   this.setState((prevState) => ({
  //     showModal: !prevState.showModal,
  //   }));

  //   setModalIsOpen(!modalIsOpen);
  // };

  // const handleOutsideClick = (e) => {
  //   if (!this.node.contains(e.target)) this.handleClick();
  // };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#F0AA89",
      zIndex: 1,
    },
  };

  return (
    <div
      onClick={() => {
        setModalIsOpen(false);
      }}
    >
      <Modal
        isOpen={modalIsOpen}
        appElement={document.getElementById("root") || undefined}
        style={customStyles}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "cneter",
            justifyContent: "center",
          }}
        >
          <TableContainer component={Paper}>
            <Table
              style={{
                color: "#000",
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: 5,
                border: "1px solid #e0e0eb",
              }}
            >
              <TableBody>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Min</TableCell>
                  <TableCell>Max</TableCell>
                </TableRow>
                {channels?.map((rowData, rowI) => {
                  return (
                    <TableRow key={`tr--${rowI}`}>
                      <TableCell
                        key={`td--${rowI}-2`}
                        style={{
                          // border: "1px solid #e0e0eb",
                          padding: 0,
                        }}
                      >
                        {rowData.name}
                      </TableCell>

                      <TableCell
                        key={`td--${rowI}-3`}
                        style={{
                          // border: "1px solid #e0e0eb",
                          padding: 0,
                        }}
                      >
                        <input
                          type="number"
                          style={{
                            //width: "20%",
                            outline: "none",
                            border: "none",
                          }}
                          value={rowData.minimum}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onChange={(newColumnData) => {
                            updateRanges(
                              rowI,
                              "minimum",
                              newColumnData.target.value
                            );
                          }}
                        />
                      </TableCell>

                      <TableCell
                        key={`td--${rowI}-4`}
                        style={{
                          // border: "1px solid #e0e0eb",
                          padding: 0,
                        }}
                      >
                        <input
                          type="number"
                          style={{
                            //width: "20%",
                            outline: "none",
                            border: "none",
                          }}
                          value={rowData.maximum}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onChange={(newColumnData) => {
                            updateRanges(
                              rowI,
                              "maximum",
                              newColumnData.target.value
                            );
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            style={{
              backgroundColor: "rgb(102, 102, 170)",
              maxHeight: "50px",
              marginTop: "20px",
              marginBottom: "25px",
              color: "white",
            }}
            size="small"
            onClick={() => {
              props.onRangeChange(channels);
              setModalIsOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </Modal>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingLeft: 5,
          paddingBottom: 5,
          paddingRight: 5,
        }}
      >
        <div
          className="pc-y"
          style={{
            transform: "rotate(270deg)",
            width: "30px",
            // marginLeft: "-90px",
            // marginRight: "-80px",
            marginBottom: "15px",
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
            disableUnderline
            style={{
              width: props.plot.width * 0.35,
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
          </Select> */}
        </div>

        <Button
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
          }}
          variant="text"
          onClick={(e) => {
            e.stopPropagation();
            setModalIsOpen(true);
          }}
        >
          Ranges
        </Button>

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
            {props.plot.gate && props.onDeleteGate && (
              <Tooltip title={"delete the plot gate"}>
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
              </Tooltip>
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
                        className="form-check"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: 5,
                          backgroundColor: getOverlayColor(x.id),
                        }}
                      >
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={x.id}
                          checked={
                            props.plot?.overlays?.find((y) => y.id == x.id)
                              ? true
                              : false
                          }
                          onChange={(e) => {
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
                          className="form-check-label"
                          style={{ wordBreak: "break-all", marginLeft: 3 }}
                          // for={props.plotIndex + x.id}
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
                  <div
                    key={x?.id}
                    style={{ alignItems: "center", display: "flex" }}
                  >
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
    </div>
  );
}

export default SideSelector;
