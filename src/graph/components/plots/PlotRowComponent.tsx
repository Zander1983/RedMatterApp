import React, {useEffect} from "react";
import {
    File,
    Gate,
    Plot,
    PlotID,
    PlotSpecificWorkspaceData,
    Population,
    Workspace as WorkspaceType,
    Workspace
} from "../../resources/types";
import {useSelector} from "react-redux";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import {standardGridPlotItem} from "../workspaces/PlotController";
import PlotComponent from "./PlotComponent";
import {makeStyles} from "@material-ui/core";
import {getFile, getGate, getPopulation, getWorkspace} from "../../utils/workspace";
//@ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout";
import WorkspaceDispatch from "../../workspaceRedux/workspaceDispatchers";
import _ from "lodash";

interface Props {
    sharedWorkspace: boolean;
    experimentId: string;
    workspace: Workspace;
    workspaceLoading: boolean;
    customPlotRerender: PlotID[];
    plotMoving?: boolean;
    // arrowFunc: Function;
    file:any
}

interface PlotsAndFiles {
    plot: Plot;
    file: File;
}

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
const ResponsiveGridLayout = WidthProvider(Responsive);

export const setCanvasSize = (
    save: boolean = false,
    isAsync: boolean = false
) => {
    const plots = getWorkspace().plots;
    const updateList: Plot[] = [];
    for (let plot of plots) {
        let id = `canvas-${plot.id}`;
        let displayRef = `display-ref-${plot.id}`;
        let barRef = `bar-ref-${plot.id}`;

        let docIdRef = document.getElementById(id);
        let docDisplayRef: any = document.getElementById(displayRef);
        let docBarRef: any = document.getElementById(barRef);

        if (docBarRef && docDisplayRef && docIdRef) {
            let width = docDisplayRef.offsetWidth - 50;
            let height = docDisplayRef.offsetHeight - docBarRef.offsetHeight - 40;
            plot.plotHeight = height;
            plot.plotWidth = width;

            docIdRef.setAttribute("style", `width:${width}px;height:${height}px;`);
            updateList.push(plot);
        }
    }
    if (save && plots.length > 0) {
        if (isAsync)
            _.debounce(() => WorkspaceDispatch.UpdatePlots(updateList), 100);
        else WorkspaceDispatch.UpdatePlots(updateList); //setTimeout( () => , 10);
    }
};

export const MINW = 9;
export const MINH = 10;

export const resetPlotSizes = (id?: string) => {
    let tPlots = getWorkspace().plots.map((e) => e.id);
    if (id) tPlots = [id];
    for (const id of tPlots) {
        let docIdRef = document.getElementById(`canvas-${id}`);
        let docDisplayRef: any = document.getElementById(`display-ref-${id}`);
        let docBarRef: any = document.getElementById(`bar-ref-${id}`);

        if (docBarRef && docDisplayRef && docIdRef) {
            let width = docDisplayRef.offsetWidth - 55;
            let height = docDisplayRef.offsetHeight - docBarRef.offsetHeight - 40;
            docIdRef.setAttribute("style", `width:${width}px;height:${height}px;`);
        }
    }
};

const PlotRowComponent = ({workspace, sharedWorkspace, customPlotRerender, experimentId, workspaceLoading, file}:Props) => {
    const classes = useStyles();

    const getTableRowPlots = (file: File) => {
        if (file !== null) {
            let plots: PlotsAndFiles[] = [];
            let populations: Population[] = [];
            populations = workspace.populations.filter(
                (population) => population.file === file.id
            );

            workspace.plots.map((plot) => {
                populations.map((population) => {
                    if (population.id === plot.population) {
                        plots.push({ plot, file: getFile(population.file) });
                    }
                });
            });
            return plots;
        }
    };

    const getPlotRelevantResources = (plot: Plot) => {
        const population = getPopulation(plot.population);
        const file = getFile(population.file);
        const gates: Gate[] = [
            ...plot.gates.map((e) => getGate(e)).filter((x) => x),
            ...population.gates.map((e) => getGate(e.gate)),
        ];
        const workspaceForPlot: PlotSpecificWorkspaceData = {
            file,
            gates,
            plot,
            population,
            key: plot.id,
        };
        return workspaceForPlot;
    };

    useEffect( () => {
        function handleUserMouseUp(event:any) {
            _.debounce(() => {
                resetPlotSizes();
                setCanvasSize(true, true);
            }, 100);
        }
        function handleUserResize(event:any){
            _.debounce(() => {
                resetPlotSizes();
                setCanvasSize(true, false);
            }, 300)
        }

        window.addEventListener("mouseup", handleUserMouseUp);
        window.addEventListener("resize",handleUserResize);
        resetPlotSizes();
        setCanvasSize(true);
        return () => {
            window.removeEventListener("mouseup", handleUserMouseUp);
            window.removeEventListener("resize", handleUserResize);
        };
            // setTimeout(() => this.setState({ isTableRenderCall: true }), 1000);
    },[]);

    return (
            <TableRow>
                <TableCell>
                    <div className={classes.responsiveContainer}>
                        <ResponsiveGridLayout
                            className="layout"
                            breakpoints={{ lg: 1200 }}
                            cols={{ lg: 36 }}
                            rows={{ lg: 30 }}
                            rowHeight={30}
                            compactType={null}
                            isDraggable={workspace.editWorkspace}
                            isResizable={false}
                            onDrag={() => {}}
                            onDragStop={() => {}}
                            onDragStart={() => {}}>
                            {
                                //@ts-ignore
                                // file.view &&
                                getTableRowPlots(file).map(({ plot, file: PlotFile }, i) => {
                                            return (
                                                <div
                                                    key={plot.id}
                                                    className={classes.itemOuterDiv}
                                                    data-grid={standardGridPlotItem(
                                                        i,
                                                        plot,
                                                        workspace.plots,
                                                        workspace.editWorkspace
                                                    )}
                                                    id={`workspace-outter-${plot.id}`}
                                                >
                                                    <div
                                                        id="inner"
                                                        className={classes.itemInnerDiv}
                                                    >
                                                        <PlotComponent
                                                            plotRelevantResources={getPlotRelevantResources(
                                                                plot
                                                            )}
                                                            sharedWorkspace={sharedWorkspace}
                                                            editWorkspace={
                                                                workspace.editWorkspace
                                                            }
                                                            workspaceLoading={workspaceLoading}
                                                            customPlotRerender={
                                                                customPlotRerender
                                                            }
                                                            experimentId={experimentId}
                                                            fileName={file.name}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                    }
                                )
                            }
                        </ResponsiveGridLayout>
                    </div>
                </TableCell>
        </TableRow>
        );
};

export default PlotRowComponent;