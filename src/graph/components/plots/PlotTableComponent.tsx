import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";

import { useEffect, useState } from "react";

import WorkspaceDispatch from "graph/workspaceRedux/workspaceDispatchers";

import { Workspace } from "graph/resources/types";

import PlotHeadComponent from "./PlotHeadComponent";
import PlotRowComponent from "./PlotRowComponent";

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
    sharedWorkspace: boolean;
    experimentId: string;
    workspaceLoading: boolean;
    customPlotRerender: string[];
    // arrowFunc: Function;
}

const PlotTableComponent = ({workspace, sharedWorkspace, experimentId, workspaceLoading, customPlotRerender,}: TableProps) => {
    const classes = useStyles();
    const [data, setData] = useState([]);
    const [openFiles, setOpenFiles] = useState<string[]>([]);
    const [headers, setHeaders] = useState<string[]>([
        "File Name",
        "Click to View",
    ]);

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
        <TableContainer component={Paper} className={classes.container}>
            <Table style={{ overflowY: "scroll" }}>
                <PlotHeadComponent
                    workspace={workspace}
                    data={data}
                    headers={headers}
                    setData={setData}
                    setOpenFiles={setOpenFiles}/>
                <TableBody>
                    {workspace?.files?.map((file, i) => (
                        <PlotRowComponent
                            key={file?.id || i}
                            sharedWorkspace={sharedWorkspace}
                            experimentId={experimentId}
                            workspace={workspace}
                            workspaceLoading={workspaceLoading}
                            customPlotRerender={customPlotRerender}
                            file={file}
                            // data={data[i]}
                            headers={headers}
                            openFiles={openFiles}
                            setOpenFiles={setOpenFiles}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PlotTableComponent;
