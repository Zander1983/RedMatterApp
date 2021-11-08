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
  dropdown: {
    position: "absolute",
  },
}));

interface nodes extends RawNodeDatum {
  id: string;
  color: string;
}

const HierarchyMenu = (props: { workspace: Workspace }) => {
  const { workspace } = props;
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [selectedGate, setSelectedGate] = useState("");
  const [selectedNode, setSelectedNode] = useState<RawNodeDatum>({
    name: "Not Selected",
  });
  const [dataList, setDataList] = useState<RawNodeDatum>();

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

  const getChildrenGates = (ids: string[], data: RawNodeDatum) => {
    for (let i = 0; i < ids.length; i++) {
      const gate = workspace.gates.find((item) => item.id === ids[i]);

      const childrenData: RawNodeDatum = {
        name: gate.name,
        children: [],
      };
      data.children.push(childrenData);
      getChildrenGates(gate.children, childrenData);
    }
  };

  const constructGateHierarchy = (id: string) => {
    const tempGate = workspace.gates;

    // Removing Dulicates
    for (let i = 0; i < tempGate.length; i++) {
      for (let j = 0; j < tempGate[i].children.length; j++) {
        // taking the child from parent
        const child = tempGate[i].children[j];
        for (let k = i + 1; k < tempGate.length; k++) {
          // checking if the child is in other list or not
          const found = tempGate[k].children.find((item) => item === child);
          // if the child is in other list then remove it from the parent
          if (found) {
            tempGate[i].children = tempGate[i].children.filter(
              (item) => item !== found
            );
          }
        }
      }
    }

    const gate = workspace.gates.find((item) => item.id === id);

    const data: RawNodeDatum = {
      name: gate.name,
      children: [],
    };

    if (gate.children && gate.children.length) {
      getChildrenGates(gate.children, data);
    }
    setDataList(data);
  };

  console.log(dataList);

  useEffect(() => {
    const gate = workspace.gates.find((item) => item.id === selectedGate);
    if (!gate) {
      setDataList(undefined);
    } else {
      constructGateHierarchy(selectedGate);
    }
  }, [workspace.gates]);

  return (
    <div className={classes.container}>
      {/* Dropdown */}
      <div className={classes.dropdown}>
        <Button
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? "composition-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          className={classes.button}
        >
          Select Gates
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
                    {workspace.gates.map((item) => (
                      <MenuItem
                        onClick={(e) => {
                          setSelectedGate(item.id);
                          constructGateHierarchy(item.id);
                        }}
                      >
                        {item.name}
                        <span
                          style={{
                            height: 10,
                            width: 10,
                            marginLeft: 10,
                            border: 50,
                            backgroundColor: item.color,
                          }}
                        >
                          {" "}
                        </span>
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
        {dataList && (
          <Tree data={dataList} orientation="vertical" pathFunc="diagonal" />
        )}
      </div>
    </div>
  );
};
export default HierarchyMenu;
