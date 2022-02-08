import { makeStyles } from "@material-ui/core/styles";

import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { useEffect, useState } from "react";

import {
    Workspace,
    File,
} from "graph/resources/types";

import {
    deleteAllPlotsAndPopulationOfNonControlFile,
} from "graph/components/plots/MainBar";

import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
import deleteIcon from "assets/images/delete.png";

const useStyles = makeStyles((theme) => ({
    container: {
        backgroundColor: "#FAFAFA",
        width: "100%",
        color: "#333",
        padding: 20,
    },
    tableCell: {
        width: "auto",
        color: "#333",
        border: "1px #333 solid",
        textAlign: "center",
        padding: "5px !important",
    },
    view: {
        border: "none",
        cursor: "pointer",
        color: "white",
        fontWeight: 500,
        padding: "2px 5px",
        background: "#333333",
        minWidth: 90,
        margin: "0px 8px",
        borderRadius: 5,
    },
    arrow: {
        height: 15,
        width: 10,
        marginLeft: 5,
        cursor: "pointer",
    },
    delete: {
        height: 15,
        width: 15,
        marginLeft: 10,
        cursor: "pointer",
    },
    itemOuterDiv: {
        flex: 1,
        border: "solid 0.5px #bbb",
        boxShadow: "1px 3px 4px #bbd",
        borderRadius: 5,
        paddingBottom: "2rem",
        minWidth: 370,
        backgroundColor: "rgb(238, 238, 255)",
    },
    itemInnerDiv: {
        width: "100%",
        height: "100%",
    },
    show: {
        opacity: 1,
        display: "block",
    },
    hide: {
        opacity: 0,
        display: "none",
        transition: "opacity 1s ease-out",
    },
    responsiveContainer: {
        marginTop: 3,
        marginBottom: 10,
    },
    loaderContainerStyle: {
        position: "relative",
        left: "45vw",
        height: 419,
    },
    loader: {
        width: 50,
        height: 50,
    },
}));

interface TableProps {
    workspace: Workspace;
    // sharedWorkspace: boolean;
    // experimentId: string;
    // workspaceLoading: boolean;
    // customPlotRerender: string[];
    // arrowFunc: Function;
}

const PlotHeadComponent = ({workspace}: TableProps) => {
    const classes = useStyles();
    const [data, setData] = useState([]);
    const [openFiles, setOpenFiles] = useState<string[]>([]);
    const [headers, setHeaders] = useState<string[]>([
        "File Name",
        "Click to View",
    ]);

    const deletedPlots: string[] = [];
    const deletedPopulations: string[] = [];
    const deletedGates: string[] = [];

    const sortByColumn = (colIndex: number, type: string) => {
        let array = data;

        // filtering out the neumeric values from the string
        array = array.map((arr) => {
            return arr.map((value: any, index: number) => {
                if (index !== 0 && index !== arr.length - 1) {
                    return parseFloat(value.match(/[-+]?([0-9]*\.[0-9]+|[0-9]+)/));
                } else {
                    return value;
                }
            });
        });

        array.sort(sortFunction);

        // this is the sort function
        function sortFunction(a: string[], b: string[]) {
            if (a[colIndex] === b[colIndex]) {
                return 0;
            } else {
                if (type === "asc") {
                    return a[colIndex] < b[colIndex] ? -1 : 1;
                } else if (type === "dsc") {
                    return a[colIndex] > b[colIndex] ? -1 : 1;
                }
            }
        }

        // converting the neumeric values to suitable string format
        array = array.map((arr) => {
            return arr.map((value: number, index: number) => {
                if (index !== 0 && index !== arr.length - 1) {
                    if (value === 1) {
                        return `< ${value}%`;
                    } else {
                        return `${value} %`;
                    }
                } else {
                    return value;
                }
            });
        });
        const files: File[] = [];
        for (let i = 0; i < workspace.files.length; i++) {
            files.push(workspace.files.find((item) => item.id === array[i][0]));
        }
        WorkspaceDispatch.SetFiles(files);
        setData(array);
    };

    const deleteChildGate = (children: string[]) => {
        children.map((child) => {
            workspace.populations.map((pop) => {
                if (pop.gates && pop.gates.length > 0) {
                    if (pop.gates[0].gate === child) {
                        workspace.plots.map((plot) => {
                            if (plot.gates.includes(child)) {
                                plot.gates = plot.gates.filter((gate) => gate !== child);
                                WorkspaceDispatch.UpdatePlot(plot);
                            }
                            if (plot.population === pop.id) {
                                deletedPlots.push(plot.id);
                            }
                        });
                        deletedPopulations.push(pop.id);
                    }
                }
            });
            if (workspace.gates.find((gate) => gate.id === child).children) {
                deleteChildGate(
                    workspace.gates.find((gate) => gate.id === child).children
                );
            }
            deletedGates.push(child);
        });
    };

    const deleteColumn = (index: number) => {
        deleteAllPlotsAndPopulationOfNonControlFile();
        workspace.populations.map((pop) => {
            if (pop.gates && pop.gates.length > 0) {
                if (pop.gates[0].gate === workspace.gates[index].id) {
                    workspace.plots.map((plot) => {
                        if (plot.gates.includes(workspace.gates[index].id)) {
                            plot.gates = plot.gates.filter(
                                (gate) => gate !== workspace.gates[index].id
                            );
                            // removing gate from the plot
                            WorkspaceDispatch.UpdatePlot(plot);
                        }
                        if (plot.population === pop.id) {
                            // deleting the plot of the gate
                            deletedPlots.push(plot.id);
                        }
                    });
                    // deleting the population of the gate
                    deletedPopulations.push(pop.id);
                }
            }
        });
        // deleting the children
        deleteChildGate(workspace.gates[index].children);

        // deleting the gate
        deletedGates.push(workspace.gates[index].id);

        // updating the parents gates
        deletedGates.map((gateId) => {
            workspace.gates.map((gate) => {
                if (gate.children.includes(gateId)) {
                    gate.children = gate.children.filter((child) => child !== gateId);
                    WorkspaceDispatch.UpdateGate(gate);
                }
            });
        });

        WorkspaceDispatch.DeletePlotsAndPopulations(
            deletedPlots,
            deletedPopulations,
            deletedGates
        );

        deletedPlots.length = 0;
        deletedPopulations.length = 0;
        deletedGates.length = 0;
    };

    useEffect(() => {
        setHeaders([
            "File Name",
            ...workspace.gates.map((gate) => gate.name),
            "Click to View",
        ]);
        if (workspace.clearOpenFiles) {
            setOpenFiles([]);
            WorkspaceDispatch.ClearOpenFiles();
        }
    }, [workspace]);

    return (
        <TableHead>
                    <TableRow>
                        {headers.map((values, index) => (
                            <TableCell className={classes.tableCell} key={"top-" + index}>
                                {values}
                                {index !== 0 && index !== headers.length - 1 && (
                                    <>
                                        <img
                                            onClick={() => {
                                                sortByColumn(index, "asc");
                                            }}
                                            src={downArrow}
                                            alt="down-arrow"
                                            className={classes.arrow}
                                        />
                                        <img
                                            onClick={() => {
                                                sortByColumn(index, "dsc");
                                            }}
                                            src={upArrow}
                                            alt="up-arrow"
                                            className={classes.arrow}
                                        />
                                        <img
                                            onClick={() => {
                                                setOpenFiles([]);
                                                deleteColumn(index - 1);
                                            }}
                                            src={deleteIcon}
                                            alt="delete-icon"
                                            className={classes.delete}
                                        />
                                    </>
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
    );
};
export default PlotHeadComponent;
