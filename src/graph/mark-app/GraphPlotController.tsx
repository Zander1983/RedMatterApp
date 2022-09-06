import React from "react";
import PlotTableComponent from "./Table";
import { snackbarService } from "uno-material-ui";
import { MenuItem, Select } from "@material-ui/core";
import * as htmlToImage from "html-to-image";
import FCSServices from "./FCSServices/FCSServices";
import {
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
} from "@material-ui/core";
import WorkspaceTopBar from "./WorkspaceTopBar";
import Modal from "@material-ui/core/Modal";
import MultiStainState from "./MultiStainState.json";
import MultiStainState3 from "./MultiStainState3.json";
import Files from "./Files.json";
import ReactGA from "react-ga";
import {
  superAlgorithm,
  createDefaultPlotSnapShot,
  getPlotChannelAndPosition,
  formatEnrichedFiles,
  DSC_SORT,
  ASC_SORT,
  loopAndCompensate,
} from "./Helper";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
import ChatBox from "./../../Components/common/ChatBox/ChatBox";

interface PlotControllerProps {
  sharedWorkspace: boolean;
  experimentId: string;
  workspaceLoading: boolean;
  plotMoving?: boolean;
  // arrowFunc: Function;
}

interface IState {
  sortByChanged: boolean;
  sortBy: string;
  isTableRenderCall: boolean;
  enrichedFiles: any[];
  workspaceState: any;
  enrichedEvents: any[];
  testParam: string;
  activePipelineId: string;
  parsedFiles: any[];
  uploadingFiles: any[];
  currentParsingFile: string;
  controlFileScale: {};
  showSpillover: boolean;
  showRanges: boolean;
  fcsFiles: any[];
  controlFileId: string;
}

class NewPlotController extends React.Component<PlotControllerProps, IState> {
  constructor(props: PlotControllerProps) {
    super(props);

    this.state = {
      sortByChanged: false,
      sortBy: "file",
      isTableRenderCall: false,
      enrichedFiles: [],
      workspaceState: {},
      enrichedEvents: [],
      testParam: "some value",
      activePipelineId: "",
      parsedFiles: [],
      uploadingFiles: [],
      currentParsingFile: "",
      controlFileScale: {},
      showSpillover: false,
      showRanges: false,
      fcsFiles: [],
      controlFileId: "",
    };

    this.onChangeChannel = this.onChangeChannel.bind(this);
    this.onOpenFileChange = this.onOpenFileChange.bind(this);
    this.onEditGate = this.onEditGate.bind(this);
    this.onAddGate = this.onAddGate.bind(this);
    this.onDeleteGate = this.onDeleteGate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onInitState = this.onInitState.bind(this);
    this.onResetToControl = this.onResetToControl.bind(this);
    this.downloadPlotAsImage = this.downloadPlotAsImage.bind(this);
    this.setNewSpillover = this.setNewSpillover.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.inputFile = React.createRef();

    if (process.env.REACT_APP_ENV == "production") {
      ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
    }
  }

  inputFile = {
    current: {
      click: function () {},
    },
  };

  // const [uploadingFiles, setUploadingFiles] = useState(Object);

  // const [currentParsingFile, setcurrentParsingFile] = useState<string>("");
  // const [parsedFiles, setParsedFiles] = useState([]);

  onInitState = (workspaceState: any) => {
    // @ts-ignore
    let copyOfLocalFiles: any[] = this.state.fcsFiles;

    //let copyOfLocalFiles: any[] = Files;

    //workspaceState = MultiStainState3;

    // @ts-ignore
    if (
      workspaceState &&
      Object.keys(workspaceState).length > 0 &&
      copyOfLocalFiles &&
      copyOfLocalFiles.length > 0
    ) {
      let enrichedFiles: any[] = superAlgorithm(
        copyOfLocalFiles,
        workspaceState
      );

      enrichedFiles = formatEnrichedFiles(enrichedFiles, workspaceState);

      let controlEnrichedFile = enrichedFiles.find(
        (enrichedFile) => enrichedFile.isControlFile
      );

      this.setState({
        ...this.state,
        controlFileScale: controlEnrichedFile.scale,
        enrichedFiles: enrichedFiles,
        workspaceState: workspaceState,
      });
    }
  };

  getEnrichedEvents = () => {
    let copyOfLocalFiles: any[] = this.state.fcsFiles;
    let enrichedEvents = superAlgorithm(
      copyOfLocalFiles,
      this.state.workspaceState
    );
    enrichedEvents = enrichedEvents.map((events: any[]) => {
      return events;
    });
    return enrichedEvents;
  };

  onAddGate = (change: any) => {
    // create a new plot from the plot that has just been gated, but remove
    // its gate and set population to be the gate.name
    let newPlot = JSON.parse(JSON.stringify(change.plot));
    newPlot.level++;
    delete newPlot.gates;

    //@ts-ignore
    let newWorkspaceState: any = this.state.workspaceState;

    //@ts-ignore
    let controlFileId: string = newWorkspaceState.controlFileId;

    let level = newPlot.level;

    let plotsAtSameLevel = (newWorkspaceState as any).files[
      controlFileId
    ].plots.filter((plot: any) => plot.level == level);

    // let numAtThatLevel = plotsAtSameLevel ? plotsAtSameLevel.length : 0;

    newPlot.left = 350 * level;
    newPlot.top = 5;
    // newPlot.top = 350 * numAtThatLevel;

    newPlot.population = change.newGate.name;
    // for histograms
    newPlot.color = change.newGate.color;

    // set the passed up plot to be in the state
    // let gatedPlot = JSON.parse(JSON.stringify(change.plot));
    // let gates: any[] = [];
    // if (gatedPlot.gates && gatedPlot.gates.length > 0) {
    //   gates = JSON.parse(JSON.stringify(gatedPlot.gates));
    //   gates.push(change.newGate);
    // } else {
    //   gates = [change.newGate];
    // }

    // this is setting the last plot to be the gated plot on the contorl
    // let origGatedPlotIndex = (newWorkspaceState as any).files[
    //   controlFileId
    // ].plots.findIndex((plot: any) => plot.population == gatedPlot.population);

    //origGatedPlot = gatedPlot;

    // (newWorkspaceState as any).files[fileId].plots[
    //   (newWorkspaceState as any).files[fileId].plots.length - 1
    // ] = JSON.parse(JSON.stringify(gatedPlot));

    // (newWorkspaceState as any).files[controlFileId].plots[
    //   origGatedPlotIndex
    // ] = JSON.parse(JSON.stringify(gatedPlot));

    // this is adding a new plot to the end of the plots array on the control
    // (newWorkspaceState as any).files[controlFileId].plots.push(newPlot);

    // new plots are only added on the control file,
    // so loop through the other fileIds - which have adjusted gates
    // and make sure to keep them
    // TODO look at below

    let fileIds = Object.keys((newWorkspaceState as any).files);
    fileIds.forEach((fileId) => {
      //if (fileId != controlFileId) {
      let origGatedPlotIndex = (newWorkspaceState as any).files[
        fileId
      ].plots.findIndex(
        (plot: any) => plot.population == change.plot.population
      );

      let gates = (newWorkspaceState as any).files[fileId].plots[
        origGatedPlotIndex
      ].gates;

      if (gates && gates.length > 0) {
        (newWorkspaceState as any).files[fileId].plots[
          origGatedPlotIndex
        ].gates.push(change.newGate);
      } else {
        (newWorkspaceState as any).files[fileId].plots[
          origGatedPlotIndex
        ].gates = [change.newGate];
      }

      (newWorkspaceState as any).files[fileId].plots.push(newPlot);

      // (newWorkspaceState as any).files[fileId].plots[
      //   (newWorkspaceState as any).files[fileId].plots.length - 1
      // ] = JSON.parse(JSON.stringify(gatedPlot));

      // (newWorkspaceState as any).files[fileId].plots.push(
      //   JSON.parse(JSON.stringify(newPlot))
      // );
      //}
    });

    let copyOfLocalFiles: any[] = this.state.fcsFiles;
    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    //set state
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  onDeleteGate = (plot: any) => {
    //@ts-ignore
    let newWorkspaceState: any = this.state.workspaceState;
    let controlFileId: string = newWorkspaceState.controlFileId;

    // deleting the children of the gate
    const plotIndex = (newWorkspaceState as any).files[
      controlFileId
    ].plots.findIndex((plt: any) => plt.population === plot.population);
    const fileIds = Object.keys((newWorkspaceState as any).files) || [];
    for (let i = 0; i < fileIds.length; i++) {
      (newWorkspaceState as any).files[fileIds[i]].plots.length = plotIndex + 1;
    }

    // deleting the gate from the parent plot
    for (let i = 0; i < fileIds.length; i++) {
      (newWorkspaceState as any).files[
        fileIds[i]
      ].plots = (newWorkspaceState as any).files[fileIds[i]].plots.map(
        (plt: any) => {
          if (plt.population === plot.population) {
            const { gate, ...plotWithOutGate } = plt;
            return plotWithOutGate;
          } else {
            return plt;
          }
        }
      );
    }

    let copyOfLocalFiles: any[] = this.state.fcsFiles;

    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    //set state
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  setPlotsOfAllFilesToBeSameAsControl = (plotIndex: any) => {
    let controlEnrichedFile = this.state.enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );
    const filesIds = Object.keys((this.state.workspaceState as any).files);
    filesIds.forEach((fileId, index) => {
      (this.state.workspaceState as any).files[fileId].plots[
        plotIndex
      ] = JSON.parse(JSON.stringify(controlEnrichedFile.plots[plotIndex]));
    });
  };

  onEditGate = (change: any) => {
    let fileKey = change.fileId;
    let newWorkspaceState: any = this.state.workspaceState;

    let isEditingControlFile = fileKey == newWorkspaceState.controlFileId;
    //newWorkspaceState.controlFileId

    if (!(newWorkspaceState as any).files[fileKey]) {
      // so its a non-control gate being edited
      // copy plots from control
      let plotsCopy = JSON.parse(
        JSON.stringify(
          (newWorkspaceState as any).files[newWorkspaceState.controlFileId]
            .plots
        )
      );

      let plot = plotsCopy.find(
        (plot: any) => plot.population == change.gate.name
      );

      plot.edited = true;
      (newWorkspaceState as any).files[fileKey] = {
        //@ts-ignore
        plots: plotsCopy,
      };
    }

    let fileIds = Object.keys((newWorkspaceState as any).files);
    fileIds.forEach((fileId) => {
      if (isEditingControlFile) {
        // so editing the control file
        // change for a file if that gate and its popuation havent been edited
        if (fileId != newWorkspaceState.controlFileId) {
          let plot = (newWorkspaceState as any).files[fileId].plots.find(
            (plot: any) => plot.population == change.gate.name
          );

          if (plot.edited != true) {
            let gateIndex = (newWorkspaceState as any).files[fileId].plots[
              change.plotIndex
            ].gates.findIndex((gate: any) => gate.name == change.gate.name);

            (newWorkspaceState as any).files[fileId].plots[
              change.plotIndex
            ].gates[gateIndex] = JSON.parse(JSON.stringify(change.gate));
          }
        } else {
          // so its the control file being edited
          let gateIndex = (newWorkspaceState as any).files[fileKey].plots[
            change.plotIndex
          ].gates.findIndex((gate: any) => gate.name == change.gate.name);

          (newWorkspaceState as any).files[fileKey].plots[
            change.plotIndex
          ].gates[gateIndex] = JSON.parse(JSON.stringify(change.gate));
        }
      } else {
        // so editing a non-control file
        if (fileId == fileKey) {
          let plot = (newWorkspaceState as any).files[fileKey].plots.find(
            (plot: any) => plot.population == change.gate.name
          );
          plot.edited = true;

          let gateIndex = (newWorkspaceState as any).files[fileKey].plots[
            change.plotIndex
          ].gates.findIndex((gate: any) => gate.name == change.gate.name);

          (newWorkspaceState as any).files[fileKey].plots[
            change.plotIndex
          ].gates[gateIndex] = JSON.parse(JSON.stringify(change.gate));
        }
      }
      // if (fileId == newWorkspaceState.controlFileId) {
      //   let origGatedPlotIndex = (newWorkspaceState as any).files[
      //     fileId
      //   ].plots.findIndex(
      //     (plot: any) => plot.population == change.plot.population
      //   );

      //   let gateIndex = (newWorkspaceState as any).files[fileKey].plots[
      //     change.plotIndex
      //   ].gates.findIndex((gate: any) => gate.name == change.gate.name);
      // }
    });

    // let gateIndex = (newWorkspaceState as any).files[fileKey].plots[
    //   change.plotIndex
    // ].gates.findIndex((gate: any) => gate.name == change.gate.name);

    // (newWorkspaceState as any).files[fileKey].plots[change.plotIndex].gates[
    //   gateIndex
    // ] = JSON.parse(JSON.stringify(change.gate));

    let copyOfLocalFiles: any[] = this.state.fcsFiles;
    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);

    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
      isTableRenderCall: true,
    });
  };

  downloadPlotAsImage = async (plot: any, plotIndex: any) => {
    // downloading functionality
    const plotElement = document.getElementById("entire-table");
    const dataUrl = await htmlToImage.toSvg(plotElement);
    var link = document.createElement("a");
    link.download = "workspace";
    link.href = dataUrl;
    link.click();
  };

  onResetToControl = (fileId: string) => {
    let newWorkspaceState: any = JSON.parse(
      JSON.stringify(this.state.workspaceState)
    );
    delete newWorkspaceState.files[fileId];
    let copyOfLocalFiles: any[] = this.state.fcsFiles;
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  addOverlay = (
    fileId: string,
    addFileId: string,
    plotIndex: number,
    checked: boolean
  ) => {
    let workspaceState = this.state.workspaceState;
    let newWorkspaceState: any = JSON.parse(JSON.stringify(workspaceState));

    let foundEnrichedFile = this.state.enrichedFiles.find(
      (x: any) => x.fileId == fileId
    );

    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    if (!newWorkspaceState.files[fileId]) {
      newWorkspaceState.files[fileId] = { plots: foundEnrichedFile.plots };
    }

    let workspaceStatePlot = newWorkspaceState.files[fileId].plots[plotIndex];
    if (!workspaceStatePlot?.overlays) {
      workspaceStatePlot.overlays = [];
    }

    if (color in workspaceStatePlot && color == workspaceStatePlot.color) {
      color = "FFF" + color.substring(0, 3);
    } else if (!(color in workspaceStatePlot) && color == "#000000") {
      color = "FFF" + color.substring(0, 3);
    }

    if (checked)
      workspaceStatePlot.overlays.push({ id: addFileId, color: color });
    else {
      let deleteIndex = workspaceStatePlot.overlays.findIndex(
        (x: any) => x.id == addFileId
      );
      workspaceStatePlot.overlays.splice(deleteIndex, 1);
    }

    let copyOfLocalFiles: any[] = this.state.fcsFiles;
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  onChangeChannel = (change: any) => {
    let type = change.type;
    let fileKey = change.fileId;
    let plotIndex = change.plotIndex;
    //let filesIds;
    let newWorkspaceState: any = this.state.workspaceState;
    if (!(newWorkspaceState as any).files[fileKey]) {
      // so its a non-control gate being edited, copy plots from control
      //@ts-ignore
      (newWorkspaceState as any).files[fileKey] = {
        plots: JSON.parse(
          JSON.stringify(
            (newWorkspaceState as any).files[newWorkspaceState.controlFileId]
              .plots
          )
        ),
      };
    }

    switch (type) {
      case "ChannelIndexChange":
        // //@ts-ignore
        // workspaceState.files[fileKey].plots[plotIndex].plotType =

        Object.keys((newWorkspaceState as any).files).forEach(
          (fileId, index) => {
            // if the file being changed is the control file, change for all
            // otherwise just change for it

            if (fileId === fileKey) {
              if (change.axis == "x") {
                newWorkspaceState = this.updateWorkspaceStateChannels(
                  "x",
                  newWorkspaceState,
                  fileId,
                  plotIndex,
                  change.axisIndex,
                  change.axisLabel,
                  change.scaleType,
                  change.plotType
                );
              } else {
                newWorkspaceState = this.updateWorkspaceStateChannels(
                  "y",
                  newWorkspaceState,
                  fileId,
                  plotIndex,
                  change.axisIndex,
                  change.axisLabel,
                  change.scaleType,
                  change.plotType
                );
              }
            }
          }
        );

        break;
      case "ChangePlotType":
        Object.keys((newWorkspaceState as any).files).forEach(
          (fileId, index) => {
            if (fileId == fileKey) {
              //@ts-ignore
              newWorkspaceState.files[fileId].plots[plotIndex].plotType =
                change.plotType;
            }
          }
        );

        break;

      case "ChangePlotScale":
        if (change.axis === "x") {
          newWorkspaceState.files[fileKey].plots[plotIndex].xScaleType =
            change.scale;
        } else {
          newWorkspaceState.files[fileKey].plots[plotIndex].yScaleType =
            change.scale;
        }
        break;
    }

    let enrichedFiles = formatEnrichedFiles(
      this.state.enrichedFiles,
      newWorkspaceState
    );

    this.setState({
      workspaceState: newWorkspaceState,
      enrichedFiles: enrichedFiles,
    });
  };

  onOpenFileChange = (change: any) => {
    this.state.workspaceState.openFile = change.fileId;
    this.setState({
      workspaceState: this.state.workspaceState,
      enrichedFiles: this.state.enrichedFiles,
    });
  };

  //@ts-ignore
  updateWorkspaceStateChannels = (
    axis: any,
    workspaceState: any,
    fileKeyBeingChanged: any,
    plotIndexBeingChanged: any,
    axisIndex: any,
    axisLabel: any,
    scaleType: any,
    plotType: any
  ) => {
    let plot = (workspaceState as any).files[fileKeyBeingChanged].plots[
      plotIndexBeingChanged
    ];
    if (axis == "x") {
      plot.xAxisIndex = axisIndex;
      plot.xAxisLabel = axisLabel;
      plot.xScaleType = scaleType;
      plot.plotType = plotType;
    } else {
      plot.yAxisIndex = axisIndex;
      plot.yAxisLabel = axisLabel;
      plot.yScaleType = scaleType;
      plot.plotType = plotType;
    }

    return JSON.parse(JSON.stringify(workspaceState));
  };

  sortByGate = (gateName: any, sortType: any) => {
    let enrichedFiles = this.state.enrichedFiles;
    let controlEnrichedFile = enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );

    enrichedFiles.sort((enrichedFile1: any, enrichedFile2: any) => {
      const gateStat1 = enrichedFile1.gateStats.find(
        (gateStat: any) => gateStat.gateName == gateName
      );

      const gateStat2 = enrichedFile2.gateStats.find(
        (gateStat: any) => gateStat.gateName == gateName
      );

      // TODO sometimes gateStat1 or gateStat2 are null - why?
      if (!gateStat1) {
        return 1;
      }

      if (!gateStat2) {
        return 0;
      }

      if (sortType === ASC_SORT) {
        if (
          parseFloat(gateStat1.percentage) > parseFloat(gateStat2.percentage)
        ) {
          return 1;
        } else if (
          parseFloat(gateStat1.percentage) < parseFloat(gateStat2.percentage)
        ) {
          return -1;
        } else {
          return 0;
        }
      } else {
        // do desc
        if (
          parseFloat(gateStat1.percentage) < parseFloat(gateStat2.percentage)
        ) {
          return 1;
        } else if (
          parseFloat(gateStat1.percentage) > parseFloat(gateStat2.percentage)
        ) {
          return -1;
        } else {
          return 0;
        }
      }
    });

    let originalFiles: any[] = this.state.fcsFiles;
    let sortedFiles = [];

    for (
      let sortedFileIndex = 0;
      sortedFileIndex < enrichedFiles.length;
      sortedFileIndex++
    ) {
      for (
        let originalFileIndex = 0;
        originalFileIndex < originalFiles.length;
        originalFileIndex++
      ) {
        if (
          originalFiles[originalFileIndex].id ===
          enrichedFiles[sortedFileIndex].fileId
        ) {
          sortedFiles.push(originalFiles[originalFileIndex]);
          break;
        }
      }
    }

    this.setState({
      enrichedFiles: enrichedFiles,
    });
  };

  onResize = (change: any) => {
    let newWorkspaceState: any = this.state.workspaceState;

    if (!(newWorkspaceState as any).files[change.fileId]) {
      // so its a non-control gate being edited, copy plots from control
      //@ts-ignore
      (newWorkspaceState as any).files[change.fileId] = {
        plots: JSON.parse(
          JSON.stringify(
            (newWorkspaceState as any).files[newWorkspaceState.controlFileId]
              .plots
          )
        ),
      };
    }

    Object.keys((newWorkspaceState as any).files).forEach((fileId, index) => {
      if (fileId == change.fileId) {
        //@ts-ignore
        newWorkspaceState.files[fileId].plots[change.plotIndex].width =
          change.width;
        newWorkspaceState.files[fileId].plots[change.plotIndex].height =
          change.height;
      }
    });

    let copyOfLocalFiles: any[] = this.state.fcsFiles;
    let enrichedFiles = superAlgorithm(copyOfLocalFiles, newWorkspaceState);
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  uploadFiles = async (files: FileList) => {
    const fileList: { tempId: string; file: File }[] = [];
    const allowedExtensions = ["fcs", "lmd"];

    let listSize = 0;
    for (const file of Array.from(files)) {
      listSize += file.size;
      if (
        !allowedExtensions.includes(file.name.split(".").pop().toLowerCase())
      ) {
        snackbarService.showSnackbar(
          file.name.substring(0, 20) +
            (file.name.length > 20 ? "..." : "") +
            '"' +
            'Is not a .fcs or .lmd file: "',
          "error"
        );
        continue;
      }
      const id = Math.random().toString(36).substring(7);
      fileList.push({ tempId: id, file });
    }

    const fcsservice = new FCSServices();
    let fcsFiles = this.state.fcsFiles || [];
    for (const file of fileList) {
      this.setState({
        ...this.state,
        currentParsingFile: file.file.name,
      });

      //setcurrentParsingFile(file.file.name);

      //fileTempIdMap[file.tempId] = "";
      let fcsFile = await file.file.arrayBuffer().then(async (e) => {
        const buf = Buffer.from(e);
        return await fcsservice.loadFileMetadata(buf).then((e) => {
          return e;
        });
      });

      //@ts-ignore
      fcsFile.name = file.file.name;
      //@ts-ignore
      fcsFile.fileId = file.file.name;
      //@ts-ignore
      fcsFile.id = file.file.name;
      //@ts-ignore
      fcsFile.label = file.file.label;

      if (process.env.REACT_APP_ENV == "production") {
        ReactGA.event({
          category: "File",
          action:
            "File with  " +
            //@ts-ignore
            fcsFile.jsonEventCount +
            " events and " +
            fcsFile.channels.length +
            " channels uploaded",
        });
      }

      let currentParsedFiles = this.state.parsedFiles || [];
      currentParsedFiles.push({
        name: file.file.name,
        //@ts-ignore
        eventCount: fcsFile.events ? fcsFile.events.length : 0,
      });

      this.setState({
        ...this.state,
        parsedFiles: JSON.parse(JSON.stringify(currentParsedFiles)),
      });

      this.setState({
        ...this.state,
        currentParsingFile: "",
      });

      fcsFiles.push(fcsFile);
    }

    let workspaceState = this.state.workspaceState;

    if (!workspaceState || Object.keys(workspaceState).length == 0) {
      let controlFile = fcsFiles[0];
      const {
        xAxisLabel,
        yAxisLabel,
        xAxisIndex,
        yAxisIndex,
        xAxisScaleType,
        yAxisScaleType,
      } = getPlotChannelAndPosition(controlFile);

      workspaceState = createDefaultPlotSnapShot(
        controlFile.id,
        xAxisLabel,
        yAxisLabel,
        xAxisIndex,
        yAxisIndex,
        xAxisScaleType,
        yAxisScaleType
      );
    }

    this.setState({
      ...this.state,
      controlFileId: this.state.controlFileId || fcsFiles[0].id,
      fcsFiles: fcsFiles,
      parsedFiles: [],
      //workspaceState: workspaceState,
    });

    this.onInitState(workspaceState);
  };

  componentDidUpdate(
    prevProps: Readonly<PlotControllerProps>,
    prevState: Readonly<IState>,
    snapshot?: any
  ): void {}

  componentDidMount() {}

  updateSpillover = (rowI: any, colI: any, newColumnData: any) => {
    if (!isNaN(parseFloat(newColumnData))) {
      //@ts-ignore
      this.state.controlFileScale.invertedMatrix.data[rowI][colI] = parseFloat(
        newColumnData
      );

      this.setState({
        ...this.state,
        controlFileScale: this.state.controlFileScale,
      });
    }
  };

  setNewSpillover = () => {
    let workspace = this.state.workspaceState;

    this.state.fcsFiles.find((fcsFile) => {
      if (fcsFile.id == workspace.controlFileId) {
        fcsFile.scale.setSpilloverInvertedMatrix(
          //@ts-ignore
          this.state.controlFileScale.invertedMatrix
        );
      }
    });
    //loopAndCompensate

    this.state.fcsFiles.forEach((fcsFile) => {
      //(events, scale, channels, origEvents)

      loopAndCompensate(
        fcsFile.events,
        fcsFile.paramNamesHasSpillover,
        fcsFile.scale,
        fcsFile.channels,
        fcsFile.channelMaximums,
        fcsFile.origEvents
      );

      // fcsFile.events = compensatedEvents;
    });

    //loopAndCompensate();

    this.onInitState(this.state.workspaceState);
  };

  updateRanges = (rowI: any, minOrMax: any, newRange: any) => {
    this.state.fcsFiles.forEach((fcsFile) => {
      fcsFile.channels[rowI][minOrMax] = newRange;
    });

    let controlEnrichedFile = this.state.enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );

    //this.state.fcsFiles.forEach((fcsFile) => {
    controlEnrichedFile.channels[rowI][minOrMax] = newRange;
    //});

    this.setState({
      ...this.state,
      fcsFiles: this.state.fcsFiles,
    });
  };

  setNewRanges = () => {
    let controlEnrichedFile = this.state.enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );

    let files = this.state.fcsFiles;
    let workspace = this.state.workspaceState;
    files.find((file) => {
      if (file.id == workspace.controlFileId) {
        file.channels.forEach((channel: any, index: any) => {
          channel.minimum = parseFloat(
            controlEnrichedFile.channels[index].minimum
          );
          channel.maximum = parseFloat(
            controlEnrichedFile.channels[index].maximum
          );
        });
      }
    });

    this.setState({
      ...this.state,
      showRanges: false,
    });

    this.onInitState(this.state.workspaceState);
  };

  renderTable = () => {
    let controlEnrichedFile = this.state.enrichedFiles.find(
      (enrichedFile) => enrichedFile.isControlFile
    );

    if (this.state.enrichedFiles?.length > 0) {
      return (
        <>
          <>
            <span
              style={{
                marginRight: 5,
                marginLeft: 5,
                fontWeight: "bold",
                color: "#ff8080",
                fontSize: "17px",
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              CHANGE CONTROL FILE:
            </span>
            <Select
              //disableUnderline
              style={{
                marginRight: 10,
              }}
              value={this.state.workspaceState.controlFileId}
              onChange={(e) => {
                let controlFile = this.state.fcsFiles.find(
                  (file) => file.id == e.target.value
                );
                const {
                  xAxisLabel,
                  yAxisLabel,
                  xAxisIndex,
                  yAxisIndex,
                  xAxisScaleType,
                  yAxisScaleType,
                } = getPlotChannelAndPosition(controlFile);

                let workspaceState = createDefaultPlotSnapShot(
                  controlFile.id,
                  xAxisLabel,
                  yAxisLabel,
                  xAxisIndex,
                  yAxisIndex,
                  xAxisScaleType,
                  yAxisScaleType
                );

                this.onInitState(workspaceState);
              }}
            >
              {this.state.enrichedFiles.map((file) => (
                <MenuItem key={file.fileId} value={file.fileId}>
                  {file.fileId}
                </MenuItem>
              ))}
            </Select>
          </>
          <Button
            variant="outlined"
            style={{
              // backgroundColor: "#6666AA",
              marginLeft: 5,
              marginBottom: 3,
              // color: "white",
            }}
            onClick={(e) => {
              let controlFile = this.state.fcsFiles.find(
                (file) => file.id == this.state.workspaceState.controlFileId
              );
              const {
                xAxisLabel,
                yAxisLabel,
                xAxisIndex,
                yAxisIndex,
                xAxisScaleType,
                yAxisScaleType,
              } = getPlotChannelAndPosition(controlFile);

              let workspaceState = createDefaultPlotSnapShot(
                controlFile.id,
                xAxisLabel,
                yAxisLabel,
                xAxisIndex,
                yAxisIndex,
                xAxisScaleType,
                yAxisScaleType
              );

              this.onInitState(workspaceState);
            }}
          >
            Reset
          </Button>
          {/* @ts-ignore */}
          {this.state.controlFileScale?.spilloverParams && (
            <Button
              variant="outlined"
              style={{
                // backgroundColor: "#6666AA",
                marginLeft: 5,
                marginBottom: 3,
                // color: "white",
              }}
              onClick={(e) =>
                this.setState({
                  ...this.state,
                  showSpillover: !this.state.showSpillover,
                })
              }
            >
              Compensation
              <img
                src={!this.state?.showSpillover ? downArrow : upArrow}
                alt="arrow-icon"
                style={{ width: 10, height: 10, marginLeft: 10 }}
              />
            </Button>
          )}
          {this.state.showSpillover && (
            <div>
              <TableContainer component={Paper}>
                <Table
                  style={{
                    color: "#000",
                    //backgroundColor: "#ffff99",
                    textAlign: "center",
                    fontWeight: "bold",
                    marginBottom: 5,
                    border: "1px solid #e0e0eb",
                  }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell>Fluorochrome</TableCell>
                      {/* @ts-ignore */}
                      {this.state.controlFileScale?.spilloverParams.map(
                        (label: any, i: any) => {
                          return (
                            <TableCell key={`th--${i}`}>{label}</TableCell>
                          );
                        }
                      )}
                    </TableRow>
                    {/* @ts-ignore */}
                    {this.state.controlFileScale?.invertedMatrix.data.map(
                      (rowData: any, rowI: number) => {
                        return (
                          <TableRow key={`tr--${rowI}`}>
                            <TableCell
                              key={`td--${rowI}`}
                              style={{
                                border: "1px solid #e0e0eb",
                                padding: 5,
                              }}
                            >
                              {
                                /* @ts-ignore */
                                this.state.controlFileScale?.spilloverParams[
                                  rowI
                                ]
                              }
                            </TableCell>

                            {rowData.map((columnData: any, colI: number) => {
                              return (
                                <TableCell
                                  key={`th-${rowI}-${colI}`}
                                  style={{
                                    border: "1px solid #e0e0eb",
                                    padding: 15,
                                  }}
                                >
                                  {columnData}
                                  {/* <TextField
                                    disabled
                                    style={
                                      {
                                        //width: "20%",
                                      }
                                    }
                                    value={columnData}
                                    onChange={(newColumnData: any) => {
                                      this.updateSpillover(
                                        rowI,
                                        colI,
                                        newColumnData.target.value
                                      );
                                    }}
                                  /> */}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* <Button
                  variant="outlined"
                  style={{
                    // backgroundColor: "#6666AA",
                    marginLeft: 5,
                    marginBottom: 3,
                    backgroundColor: "#6666AA",
                    color: "white",
                  }}
                  onClick={(e) => {
                    console.log("setting showSpillover to false ");
                    this.setState({
                      ...this.state,
                      showSpillover: false,
                    });
                    setTimeout(() => {
                      this.setNewSpillover();
                    }, 100);
                  }}
                >
                  Update
                </Button> */}
              <Button
                variant="outlined"
                style={{
                  // backgroundColor: "#6666AA",
                  marginLeft: 5,
                  marginBottom: 3,
                  backgroundColor: "#6666AA",
                  color: "white",
                }}
                onClick={(e) => {
                  this.setState({
                    ...this.state,
                    showSpillover: false,
                  });
                }}
              >
                Close
              </Button>
            </div>
          )}
          <Button
            variant="outlined"
            style={{
              // backgroundColor: "#6666AA",
              marginLeft: 5,
              marginBottom: 3,
              // color: "white",
              color: "rgb(24, 144, 255)",
            }}
            onClick={(e) =>
              this.setState({
                ...this.state,
                showRanges: !this.state.showRanges,
              })
            }
          >
            Ranges
            <img
              src={!this.state?.showRanges ? downArrow : upArrow}
              alt="arrow-icon"
              style={{ width: 10, height: 10, marginLeft: 10 }}
            />
          </Button>
          {this.state.showRanges && (
            <div>
              <>
                <TableContainer component={Paper}>
                  <Table
                    style={{
                      color: "#000",
                      //backgroundColor: "#ffff99",
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
                      {controlEnrichedFile.channels.map(
                        (rowData: any, rowI: number) => {
                          return (
                            <TableRow key={`tr--${rowI}`}>
                              <TableCell
                                key={`td--${rowI}-2`}
                                style={{
                                  border: "1px solid #e0e0eb",
                                  padding: 5,
                                }}
                              >
                                {rowData.name}
                              </TableCell>

                              <TableCell
                                key={`td--${rowI}-3`}
                                style={{
                                  border: "1px solid #e0e0eb",
                                  padding: 5,
                                }}
                              >
                                <TextField
                                  style={
                                    {
                                      //width: "20%",
                                    }
                                  }
                                  value={rowData.minimum}
                                  onChange={(newColumnData: any) => {
                                    this.updateRanges(
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
                                  border: "1px solid #e0e0eb",
                                  padding: 15,
                                }}
                              >
                                <TextField
                                  style={
                                    {
                                      //width: "20%",
                                    }
                                  }
                                  value={rowData.maximum}
                                  onChange={(newColumnData: any) => {
                                    this.updateRanges(
                                      rowI,
                                      "maximum",
                                      newColumnData.target.value
                                    );
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Button
                  variant="outlined"
                  style={{
                    // backgroundColor: "#6666AA",
                    marginLeft: 5,
                    marginBottom: 3,
                    backgroundColor: "#6666AA",
                    color: "white",
                  }}
                  onClick={(e) => {
                    this.setState({
                      ...this.state,
                      showRanges: false,
                    });
                    setTimeout(() => {
                      this.setNewRanges();
                    }, 100);
                  }}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  style={{
                    // backgroundColor: "#6666AA",
                    marginLeft: 5,
                    marginBottom: 3,
                    backgroundColor: "#6666AA",
                    color: "white",
                  }}
                  onClick={(e) => {
                    this.setState({
                      ...this.state,
                      showRanges: false,
                    });
                  }}
                >
                  Close
                </Button>
              </>
            </div>
          )}
          <WorkspaceTopBar
            fcsFiles={this.state.fcsFiles}
            workspaceState={this.state.workspaceState}
            downloadPlotAsImage={this.downloadPlotAsImage}
          />
          <div id="entire-table">
            <PlotTableComponent
              enrichedFiles={this.state.enrichedFiles}
              workspaceState={this.state.workspaceState}
              className="workspace"
              onChangeChannel={this.onChangeChannel}
              onOpenFileChange={this.onOpenFileChange}
              addOverlay={this.addOverlay}
              onAddGate={this.onAddGate}
              onDeleteGate={this.onDeleteGate}
              onEditGate={this.onEditGate}
              onResize={this.onResize}
              sortByGate={this.sortByGate}
              downloadPlotAsImage={this.downloadPlotAsImage}
              onResetToControl={this.onResetToControl}
              testParam={this.state.testParam}
            />
          </div>

          {/* {1==1 && (
            return this.renderUploadPanel();
          )
          } */}
          {this.renderUploadPanel()}
        </>
      );
    } else return null;
  };

  renderUploadPanel = () => {
    return (
      <div
        style={{
          textAlign: "center",
        }}
      >
        {this.state.currentParsingFile?.length > 0 ? (
          <>
            <Grid
              item
              xs={12}
              style={{
                textAlign: "left",
                marginTop: 15,
                marginLeft: 10,
              }}
            >
              <h3>
                <b
                  style={{
                    backgroundColor: "#ff8080",
                    border: "solid 1px #ddd",
                    borderRadius: 5,
                    padding: 5,
                    marginRight: 10,
                  }}
                >
                  Parsing file, please wait....
                </b>
                {this.state.currentParsingFile}
                <div className="fancy-spinner">
                  <div className="ring"></div>
                  <div className="ring"></div>
                  <div className="dot"></div>
                </div>
              </h3>
            </Grid>
          </>
        ) : null}
        {this.state.parsedFiles &&
          this.state.parsedFiles?.map((e: any, i: number) => {
            return (
              <div key={`uploadingFiles-${i}`}>
                <Grid
                  item
                  xs={12}
                  style={{
                    textAlign: "left",
                    marginTop: 15,
                    marginLeft: 10,
                  }}
                >
                  <h3>
                    <b
                      style={{
                        backgroundColor: "#dfd",
                        border: "solid 1px #ddd",
                        borderRadius: 5,
                        padding: 5,
                        marginRight: 10,
                      }}
                    >
                      file
                    </b>
                    {e.name}
                    {"   "}•{"   "}{" "}
                    <b
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#777",
                      }}
                    >
                      {e.eventCount + " events"}
                    </b>
                  </h3>
                </Grid>
              </div>
            );
          })}

        <div>
          <span>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#6666AA",
                maxHeight: 50,
                marginTop: 20,
                marginBottom: 25,
                color: "white",
              }}
              onClick={() => {
                this.inputFile.current.click();
              }}
            >
              <input
                type="file"
                id="file"
                //@ts-ignore
                ref={this.inputFile}
                multiple
                accept=".fcs, .lmd"
                style={{ display: "none" }}
                onChange={(e) => {
                  this.uploadFiles(e.target.files);
                }}
              />
              Add Files
            </Button>
          </span>
          <p
            style={{
              color: "#ff4d4d",
              fontWeight: "bold",
              marginBottom: 25,
            }}
          >
            Files must have the same channels
          </p>
        </div>
        <ChatBox />
      </div>
    );
  };

  render() {
    if (this.state.workspaceState.controlFileId) {
      // const plotGroups = getPlotGroups(getWorkspace().plots);
      return this.renderTable();
    } else {
      return this.renderUploadPanel();
    }
  }
}

export default NewPlotController;
