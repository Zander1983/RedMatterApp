import React, { useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import dataManager from "../../../dataManagement/dataManager";
import Plot from "graph/renderers/plotRender";

import Gate from "../../../dataManagement/gate/gate";
import PolygonGate from "graph/dataManagement/gate/polygonGate";
import { snackbarService } from "uno-material-ui";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const classes = {
  bar: {
    marginTop: 10,
    marginBottom: 10,
  },
  root: {
    borderRadius: 0,
    color: "#0f0",
    boxSizing: "border-box",
    border: "1px solid",
    borderColor: "#bddaff",
  },
  chip_hover: {
    border: "1px solid black",
  },
};

export default function GateBar(props: any) {
  const [gates, setGates] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [population, setPopulation] = React.useState([]);
  const [observers, setObservers] = React.useState([]);
  const [gateChipHover, setGateChipHover] = React.useState(false);
  const plot: Plot = props.plot;

  const changeGatePlotState = (gateId: string, selected: boolean) => {
    try {
      const gateID = gates.find((gate) => gate.id === gateId).id;
      if (selected) {
        dataManager.unlinkGateFromPlot(plot.plotData.id, gateID);
      } else {
        dataManager.linkGateToPlot(plot.plotData.id, gateID);
      }
      update();
    } catch {
      snackbarService.showSnackbar(
        "There was an error updating gates, please try again.",
        "error"
      );
    }
  };

  const update = () => {
    if (
      !dataManager.ready() ||
      plot === undefined ||
      plot.plotData === undefined
    )
      return;
    let plotGates = plot.plotData.gates.map((e) => e.gate);
    const pop = plot.plotData.population.map((e) => e.gate);
    setPopulation(pop);
    plotGates = plotGates.filter((e: any) => {
      for (const gate of pop) {
        if (gate.id === e.id) return false;
      }
      return true;
    });
    setSelected(plotGates);
    let cgates: Gate[] = [];
    dataManager.getAllGates().forEach((v) => {
      cgates.push(v.gate);
    });
    setGates(cgates);
  };

  useEffect(() => {
    update();
    setObservers([
      {
        target: "addNewGateToWorkspace",
        value: dataManager.addObserver("addNewGateToWorkspace", () => {
          update();
        }),
      },
      {
        target: "linkGateToPlot",
        value: dataManager.addObserver("linkGateToPlot", () => {
          update();
        }),
      },
      {
        target: "unlinkGateFromPlot",
        value: dataManager.addObserver("unlinkGateFromPlot", () => {
          update();
        }),
      },
      {
        target: "clearWorkspace",
        value: dataManager.addObserver("clearWorkspace", () => {
          update();
        }),
      },
    ]);
    return () => {
      observers.forEach((e) => {
        dataManager.removeObserver(e.terget, e.value);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gateInPopulation = (id: string) => {
    for (const gate of population) if (gate.id === id) return true;
    return false;
  };

  const onGateChipClick = (option: any) => {
    props.onGateDoubleClick(option.xAxis, option.yAxis);
  };

  return (
    <Grid
      xs={12}
      item
      container
      direction="column"
      style={{
        ...classes.bar,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridGap: 10,
      }}
    >
      <Grid item>
        <Autocomplete
          multiple
          options={population}
          value={population.filter((e: any) => {
            for (const gate of population) {
              if (gate.id === e.id) return true;
            }
            return false;
          })}
          disableClearable
          noOptionsText={"All"}
          disableCloseOnSelect
          getOptionLabel={(option) => option.name}
          renderOption={(option, { selected }) => (
            <Button
              style={{
                flex: 1,
                justifyContent: "left",
                textTransform: "none",
              }}
            >
              {option.name} - ({option.xAxis}, {option.yAxis})
            </Button>
          )}
          style={{ flex: 1, height: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="outlined"
              label={
                population.length > 0
                  ? `Population (${population.length})`
                  : "Population: All"
              }
            />
          )}
          renderTags={(tagValue, _) => {
            return tagValue.map((option) => (
              <Chip
                label={option.name}
                avatar={
                  <div
                    style={{
                      borderRadius: "50%",
                      width: 12,
                      height: 12,
                      marginLeft: 7,
                      border: "solid 2px #999",
                      backgroundColor: option.color,
                    }}
                  ></div>
                }
                {...props}
                style={{
                  marginLeft: 5,
                  marginTop: 5,
                  height: 27,
                }}
              />
            ));
          }}
        />
      </Grid>
      <Grid item>
        <Autocomplete
          multiple
          options={gates.filter(
            (e) => population.filter((pop) => pop.id === e.id).length === 0
          )}
          value={gates.filter((e: any) => {
            for (const gate of selected) {
              if (gate.id === e.id) {
                return population.filter((pop) => pop.id === e.id).length === 0;
              }
            }
            return false;
          })}
          disableCloseOnSelect
          getOptionLabel={(option) => option.name}
          renderOption={(option, { selected }) => (
            <Button
              onClick={() => {
                if (!gateInPopulation(option.id)) {
                  changeGatePlotState(option.id, selected);
                }
              }}
              style={{
                flex: 1,
                justifyContent: "left",
                textTransform: "none",
              }}
            >
              <Checkbox
                icon={icon}
                disabled={gateInPopulation(option.id)}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8, textAlign: "left", padding: 0 }}
                checked={selected || gateInPopulation(option.id)}
              />
              {option.name} - ({option.xAxis}, {option.yAxis})
            </Button>
          )}
          style={{ flex: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="outlined"
              label={`Gates (${gates.length})`}
            />
          )}
          renderTags={(tagValue, _) => {
            return tagValue.map((option) => (
              <Chip
                onDoubleClick={() => {
                  onGateChipClick(option);
                }}
                onMouseEnter={() => {
                  setGateChipHover(true);
                }}
                onMouseLeave={() => {
                  setGateChipHover(false);
                }}
                className={`chip_hover`}
                label={option.name}
                disabled={gateInPopulation(option.id)}
                avatar={
                  <div
                    style={{
                      borderRadius: "50%",
                      width: 12,
                      height: 12,
                      marginLeft: 7,
                      border: "solid 2px #999",
                      backgroundColor: option.color,
                    }}
                  ></div>
                }
                onDelete={() => {
                  if (!gateInPopulation(option.id)) {
                    changeGatePlotState(option.id, true);
                  }
                }}
                {...props}
                style={{
                  marginLeft: 5,
                  marginTop: 5,
                  height: 27,
                  backgroundColor: `${gateChipHover ? "#BAC1C1" : "#E0E0E0"}`,
                }}
              />
            ));
          }}
        />
      </Grid>
    </Grid>
  );
}
