import React, { useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";

import dataManager from "graph/old/dataManagement/dataManager";
import Gate from "graph/old/dataManagement/gate/gate";
import PlotData from "graph/old/dataManagement/plotData";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const classes = {
  bar: {
    width: 230,
    paddingLeft: 3,
    paddingRight: 3,
  },
  autocomplete: {
    marginTop: -10,
    marginBottom: -10,
  },
};

export default function Overlays(props: { plot: PlotData }) {
  const plot = props.plot;
  const [overlays, setOverlays] = React.useState([]);
  const [observers, setObservers] = React.useState([]);

  const changeOverlayState = (overlay: PlotData, selected: boolean) => {
    if (selected) {
      plot.addOverlay(overlay);
    } else {
      plot.removeOverlay(overlay.id);
    }
    update();
  };

  const update = () => {
    const unselected = dataManager.getAllPlots().map((e) => e.plot);
    setOverlays(unselected);
  };

  const plotInOverlays = (id: string) => {
    for (const overlay of plot.histogramOverlays)
      if (overlay.plot === id) return true;
    return false;
  };

  useEffect(() => {
    update();
    setObservers([
      {
        target: "addNewPlotToWorkspace",
        value: dataManager.addObserver("addNewPlotToWorkspace", () => {
          update();
        }),
      },
      {
        target: "removePlotFromWorkspace",
        value: dataManager.addObserver("removePlotFromWorkspace", () => {
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
  }, []);

  return (
    <Grid xs={12} container direction="column" style={classes.bar}>
      <Autocomplete
        style={classes.autocomplete}
        multiple
        options={overlays}
        value={overlays.filter((e: any) => {
          for (const overlay of plot.histogramOverlays) {
            if (overlay.plot === e.id) return true;
          }
          return false;
        })}
        disableCloseOnSelect
        getOptionLabel={(option) => option.label}
        renderOption={(option, { selected }) => (
          <Button
            onClick={() => {
              changeOverlayState(option, !plotInOverlays(option.id));
            }}
            style={{
              flex: 1,
              justifyContent: "left",
              textTransform: "none",
            }}
          >
            <Checkbox
              icon={icon}
              disabled={plotInOverlays(option.id)}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8, textAlign: "left", padding: 0 }}
              checked={selected || plotInOverlays(option.id)}
            />
            {option.label} - ({option.file.name})
          </Button>
        )}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Population" />
        )}
        renderTags={(tagValue, _) => {
          return tagValue.map((option) => (
            <Chip
              label={option.label}
              onDelete={() => {
                changeOverlayState(option, !plotInOverlays(option.id));
              }}
              {...props}
              style={{ marginLeft: 5 }}
            />
          ));
        }}
      />
    </Grid>
  );
}
