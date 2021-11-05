import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Tree from "react-d3-tree";
import { RawNodeDatum } from "react-d3-tree/lib/types/common";
import { Workspace } from "graph/resources/types";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
  },
  button: {
    width: 200,
    marginTop: 10,
    marginLeft: 10,
    background: "#EEEEFF",
  },
  tree: {
    margin: "auto",
    width: "100%",
    height: "50vh",
  },
}));

interface nodes extends RawNodeDatum {
  id: string;
}

const HierarchyMenu = (props: { workspace: Workspace }) => {
  const { workspace } = props;
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [selectedNode, setSelectedNode] = useState<RawNodeDatum>({
    name: "Not Selected",
  });
  const [dataList, setDataList] = useState<nodes[]>([]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: any) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  // Getting the root of each file
  const getRootPlotId = (id: string) => {
    const population = workspace.populations.find((item) => item.file === id);
    if (population) {
      const plot = workspace.plots.find(
        (item) => item.population === population.id
      );
      if (plot) {
        return plot;
      }
      return "END";
    }
    return "END";
  };

  // getting the coresponding children of each root node.
  const getChildPlot = (gate: string) => {
    const population = workspace.populations.find((population) => {
      return population.gates.find((item) => item.gate === gate);
    });
    if (population) {
      const plot = workspace.plots.find(
        (item) => item.population === population.id
      );
      if (plot) {
        return plot;
      }
      return "END";
    }
    return "END";
  };

  // constructing the datastructing on the initial mount
  useEffect(() => {
    setDataList([]);
    workspace.files.map((item) => {
      const data: nodes = { id: item.id, name: item.name, children: [] };
      const rootPlot = getRootPlotId(item.id);
      if (rootPlot === "END") {
        setDataList((prev) => [...prev, data]);
      } else {
        rootPlot.gates.map((gate) => {
          const plot = getChildPlot(gate);
          if (plot !== "END") {
            data.children.push({ name: plot.label });
          }
        });
        setDataList((prev) => [...prev, data]);
      }
    });
  }, []);

  return (
    <div className={classes.container}>
      {/* Dropdown */}
      <div>
        <Button
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? "composition-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          className={classes.button}
        >
          Select Files
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom-start" ? "left top" : "left bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    {workspace.files.map((item) => (
                      <MenuItem
                        onClick={(e) => {
                          const { id, ...rest } = dataList.find(
                            (element) => element.id === item.id
                          );
                          setSelectedNode(rest);
                          handleClose(e);
                        }}
                      >
                        {item.name}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>

      {/* Tree */}
      <div className={classes.tree}>
        {selectedNode.name !== "Not Selected" && (
          <Tree
            data={selectedNode}
            orientation="vertical"
            pathFunc="diagonal"
          />
        )}
      </div>
    </div>
  );
};
export default HierarchyMenu;
