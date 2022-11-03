import React from "react";
import PlotTableComponent from "./Table";
import { snackbarService } from "uno-material-ui";
import { Tooltip } from "@material-ui/core";
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
// import Modal from "@material-ui/core/Modal";
//@ts-ignore
import Modal from "react-modal";
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
  updateEnrichedFilesPlots,
  shouldCalculateMeanMedian,
} from "./Helper";
import upArrow from "assets/images/up_arrow.png";
import downArrow from "assets/images/down_arrow.png";
import ChatBox from "./../../Components/common/ChatBox/ChatBox";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

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
  // controlFileId: string;
  userSignUpModalShowing: boolean;
  signUpEmail: string;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgb(125 204 204)",
  },
};

class NewPlotController extends React.Component<PlotControllerProps, IState> {
  firebaseApp = {};

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
      // controlFileId: "",
      userSignUpModalShowing: false,
      signUpEmail: "",
    };

    this.onChangeTableDataType = this.onChangeTableDataType.bind(this);
    this.onChangeColWidth = this.onChangeColWidth.bind(this);
    this.onChangeGateName = this.onChangeGateName.bind(this);
    this.onChangeChannel = this.onChangeChannel.bind(this);
    this.onOpenFileChange = this.onOpenFileChange.bind(this);
    this.onEditGate = this.onEditGate.bind(this);
    this.onEditGateNamePosition = this.onEditGateNamePosition.bind(this);
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

    const firebaseConfig = {
      apiKey: "AIzaSyAQvoAX5AHZ-BO20IbqN_E7-zJrXC5XcQo",
      authDomain: "red-matter-1ed2f.firebaseapp.com",
      projectId: "red-matter-1ed2f",
      storageBucket: "red-matter-1ed2f.appspot.com",
      messagingSenderId: "694058183837",
      appId: "1:694058183837:web:f46f7700d16f484c623874",
      measurementId: "G-JSEH91J4NT",
    };

    this.firebaseApp = initializeApp(firebaseConfig);
  }

  inputFile = {
    current: {
      click: function () {},
    },
  };

  onInitState = (workspaceState: any) => {
    // @ts-ignore
    let copyOfLocalFiles: any[] = this.state.fcsFiles;

    //let copyOfLocalFiles: any[] = Files;

    //workspaceState = MultiStainState3;

    const calculateMedianAndMean = shouldCalculateMeanMedian(
      workspaceState.tableDataType
    );
    console.log("calculateMedianAndMean is ", calculateMedianAndMean);
    // @ts-ignore
    if (
      workspaceState &&
      Object.keys(workspaceState).length > 0 &&
      copyOfLocalFiles &&
      copyOfLocalFiles.length > 0
    ) {
      let enrichedFiles: any[] = superAlgorithm(
        copyOfLocalFiles,
        workspaceState,
        calculateMedianAndMean
      );

      enrichedFiles = formatEnrichedFiles(enrichedFiles, workspaceState);

      // let controlEnrichedFile = enrichedFiles.find(
      //   (enrichedFile) => enrichedFile.isControlFile
      // );

      this.setState({
        ...this.state,
        controlFileScale: enrichedFiles[0].scale,
        enrichedFiles: enrichedFiles,
        workspaceState: workspaceState,
      });
    }
  };

  onChangeGateName = (
    changedPlot: any,
    changedGate: any,
    gateNameHasChanged: boolean,
    newGateName: string,
    gateColorHasChanged: boolean,
    newGateColor: string
  ) => {
    this.state.workspaceState.plots.forEach((plot: any) => {
      if (plot.gates) {
        //if (changedPlot.population == plot.population) {
        plot.gates.forEach((gate: any) => {
          // change the gate name
          if (gate.name == changedGate.name) {
            if (gateNameHasChanged) {
              gate.name = newGateName;
            }

            if (gateColorHasChanged) {
              gate.color = newGateColor;
            }
          }

          //change the parent
          if (gate.parent == changedGate.name) {
            if (gateNameHasChanged) {
              gate.parent = newGateName;
            }
          }

          // if (gate.name == changedGate.name) {
          //   if (gateNameHasChanged) {
          //     gate.name = newGateName;
          //   }

          //   if (gateColorHasChanged) {
          //     gate.color = newGateColor;
          //   }
          // }
        });
      }

      if (plot.population == changedGate.name) {
        if (gateNameHasChanged) {
          plot.population = newGateName;
        }

        if (gateColorHasChanged) {
          plot.color = newGateColor;
        }
      }
    });

    //customGates

    if (this.state.workspaceState && this.state.workspaceState.customGates) {
      this.state.workspaceState.customGates.forEach((gate: any) => {
        if (gate.name == changedGate.name) {
          if (gateNameHasChanged) {
            gate.name = newGateName;
          }

          if (gateColorHasChanged) {
            gate.color = newGateColor;
          }
        }
      });
    }

    updateEnrichedFilesPlots(
      this.state.enrichedFiles,
      this.state.workspaceState,
      gateNameHasChanged,
      changedGate.name,
      newGateName,
      gateColorHasChanged,
      changedGate.color,
      newGateColor
    );

    this.setState({
      enrichedFiles: this.state.enrichedFiles,
      workspaceState: this.state.workspaceState,
    });
  };

  onChangeColWidth = (population: any, width: any) => {
    this.state.workspaceState.plots.forEach((plot: any) => {
      if (plot.population == population) {
        plot.colWidth = width;
      }
    });

    this.setState({
      enrichedFiles: this.state.enrichedFiles,
      workspaceState: this.state.workspaceState,
    });
  };

  onAddGate = (change: any) => {
    // create a new plot from the plot that has just been gated, but remove
    // its gate and set population to be the gate.name
    let newPlot = JSON.parse(JSON.stringify(change.plot));
    newPlot.level++;
    delete newPlot.gates;

    //@ts-ignore
    let newWorkspaceState: any = this.state.workspaceState;

    let level = newPlot.level;

    //@ts-ignore
    let plotsAtSameLevel = (newWorkspaceState as any).plots.filter(
      (plot: any) => plot.level == level
    );

    let numAtThatLevel = plotsAtSameLevel ? plotsAtSameLevel.length : 0;

    newPlot.left =
      (change.plot.plotType == "scatter" ? 350 : 450) * level +
      20 * numAtThatLevel;
    newPlot.top = change.plot.top + 20 * numAtThatLevel;
    // newPlot.top = 350 * numAtThatLevel;

    newPlot.population = change.newGate.name;
    // for histograms
    newPlot.color = change.newGate.color;
    newPlot.madeOnFile = change.fileId;

    change.newGate.madeOnFile = change.fileId;

    // new plots are only added on the control file,
    // so loop through the other fileIds - which have adjusted gates
    // and make sure to keep them
    // TODO look at below

    let origGatedPlotIndex = (newWorkspaceState as any).plots.findIndex(
      (plot: any) => plot.population == change.plot.population
    );

    let gates = (newWorkspaceState as any).plots[origGatedPlotIndex].gates;

    if (gates && gates.length > 0) {
      (newWorkspaceState as any).plots[origGatedPlotIndex].gates.push(
        change.newGate
      );
    } else {
      (newWorkspaceState as any).plots[origGatedPlotIndex].gates = [
        change.newGate,
      ];
    }

    let fileIds = Object.keys((newWorkspaceState as any).files);
    fileIds.forEach((fileId) => {
      //if (fileId != controlFileId) {

      let plot = (newWorkspaceState as any).files[fileId].plots.find(
        (plot: any) => plot.population == change.plot.population
      );

      if (plot) {
        if (plot.gates && plot.gates.length > 0) {
          plot.gates.push(change.newGate);
        } else {
          plot.gates = [change.newGate];
        }
      }
    });

    (newWorkspaceState as any).plots.push(newPlot);

    let copyOfLocalFiles: any[] = this.state.fcsFiles;
    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    const calculateMedianAndMean = shouldCalculateMeanMedian(
      this.state.workspaceState.tableDataType
    );

    let enrichedFiles = superAlgorithm(
      copyOfLocalFiles,
      newWorkspaceState,
      calculateMedianAndMean
    );
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    //set state
    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  onDeleteGate = (gateName: any) => {
    //@ts-ignore
    let newWorkspaceState: any = this.state.workspaceState;

    // find the plot in the array
    // if the plot has gates, find those plots and remove them from plots array
    // remove them from plots array
    // loop through
    let plotsToBeRemoved = [gateName];
    let allPlots = (newWorkspaceState as any).plots;

    allPlots.forEach((plot: any) => {
      if (plotsToBeRemoved.indexOf(plot.population) > -1) {
        if (plot.gates) {
          plot.gates.forEach((gate: any) => {
            plotsToBeRemoved.push(gate.name);
          });
        }
      }
    });

    (newWorkspaceState as any).plots = (newWorkspaceState as any).plots.filter(
      (plot: any) => {
        if (plotsToBeRemoved.indexOf(plot.population) < 0) {
          if (plot.gates) {
            plot.gates = plot.gates.filter(
              (gate: any) => gate.name != gateName
            );
          }

          return plot;
        }
      }
    );

    if ((newWorkspaceState as any).customGates) {
      (newWorkspaceState as any).customGates = (newWorkspaceState as any).customGates.filter(
        (gate: any) => {
          if (plotsToBeRemoved.indexOf(gate.name) < 0) {
            return gate;
          }
        }
      );
    }

    let copyOfLocalFiles: any[] = this.state.fcsFiles;

    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    const calculateMedianAndMean = shouldCalculateMeanMedian(
      this.state.workspaceState.tableDataType
    );
    let enrichedFiles = superAlgorithm(
      copyOfLocalFiles,
      newWorkspaceState,
      calculateMedianAndMean
    );
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
    let newWorkspaceState: any = this.state.workspaceState;

    let isEditingOriginalFile = change.gate.madeOnFile == change.fileId;
    //newWorkspaceState.controlFileId

    if (isEditingOriginalFile) {
      let gateIndex = (newWorkspaceState as any).plots[
        change.plotIndex
      ].gates.findIndex((gate: any) => gate.name == change.gate.name);

      (newWorkspaceState as any).plots[change.plotIndex].gates[
        gateIndex
      ] = JSON.parse(JSON.stringify(change.gate));
    } else {
      // so editing existing gate on a different file
      if (!(newWorkspaceState as any).customGates) {
        (newWorkspaceState as any).customGates = [];
      }

      let customGate = JSON.parse(JSON.stringify(change.gate));
      customGate.madeOnFile = change.fileId;

      let gateIndex = (newWorkspaceState as any).customGates.findIndex(
        (g: any) => g.name == customGate.name && g.madeOnFile == change.fileId
      );
      if (gateIndex > -1) {
        (newWorkspaceState as any).customGates[gateIndex] = customGate;
      } else {
        (newWorkspaceState as any).customGates.push(customGate);
      }
    }

    newWorkspaceState.plots.forEach((plot: any) => {
      plot.reRender = !plot.reRender;
    });

    if (
      !isEditingOriginalFile ||
      (newWorkspaceState as any).files[change.fileId]
    ) {
      // so its an editing of a gate only on that file
    }

    let copyOfLocalFiles: any[] = this.state.fcsFiles;
    // let copyOfLocalFiles = JSON.parse(JSON.stringify(Files21));
    const calculateMedianAndMean = shouldCalculateMeanMedian(
      this.state.workspaceState.tableDataType
    );
    let enrichedFiles = superAlgorithm(
      copyOfLocalFiles,
      newWorkspaceState,
      calculateMedianAndMean
    );

    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
      isTableRenderCall: !this.state.isTableRenderCall,
    });
  };

  onChangeTableDataType = (change: any) => {
    let enrichedFiles = this.state.enrichedFiles;

    // TODO need to run superAlgorithm()

    if (change.tableDataType == "Mean" || change.tableDataType == "Median") {
      // if its currently neither
      if (
        this.state.workspaceState.tableDataType == "Count" ||
        this.state.workspaceState.tableDataType == "Percentage"
      ) {
        // need to run Super
        enrichedFiles = superAlgorithm(
          this.state.fcsFiles,
          this.state.workspaceState,
          true
        );

        console.log("enrichedFiles is ", enrichedFiles);

        enrichedFiles = formatEnrichedFiles(
          enrichedFiles,
          this.state.workspaceState
        );
      }
    }

    this.state.workspaceState.tableDataType = change.tableDataType;

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: this.state.workspaceState,
      isTableRenderCall: !this.state.isTableRenderCall,
    });
  };

  onEditGateNamePosition = (change: any) => {
    let newWorkspaceState: any = this.state.workspaceState;

    let gateIndex = (newWorkspaceState as any).plots[
      change.plotIndex
    ].gates.findIndex((gate: any) => gate.name == change.gateName);

    (newWorkspaceState as any).plots[change.plotIndex].gates[
      gateIndex
    ].gateNamePosition = change.gateNamePosition;

    this.state.enrichedFiles.forEach((file) => {
      file.plots[change.plotIndex].gates[gateIndex].gateNamePosition =
        change.gateNamePosition;
    });

    if (this.state.workspaceState && this.state.workspaceState.customGates) {
      this.state.workspaceState.customGates.forEach((gate: any) => {
        if (gate.name == change.gateName) {
          gate.gateNamePosition = change.gateNamePosition;
        }
      });
    }

    this.setState({
      enrichedFiles: this.state.enrichedFiles,
      workspaceState: newWorkspaceState,
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
    const calculateMedianAndMean = shouldCalculateMeanMedian(
      this.state.workspaceState.tableDataType
    );
    let enrichedFiles = superAlgorithm(
      copyOfLocalFiles,
      newWorkspaceState,
      calculateMedianAndMean
    );
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

    // if (!newWorkspaceState.files[fileId]) {
    //   newWorkspaceState.files[fileId] = { plots: foundEnrichedFile.plots };
    // }

    let workspaceStatePlot = newWorkspaceState.plots[plotIndex];
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
    const calculateMedianAndMean = shouldCalculateMeanMedian(
      this.state.workspaceState.tableDataType
    );
    let enrichedFiles = superAlgorithm(
      copyOfLocalFiles,
      newWorkspaceState,
      calculateMedianAndMean
    );
    enrichedFiles = formatEnrichedFiles(enrichedFiles, newWorkspaceState);

    this.setState({
      enrichedFiles: enrichedFiles,
      workspaceState: newWorkspaceState,
    });
  };

  onChangeChannel = (change: any) => {
    // console.log("in on channel change");
    let type = change.type;
    let fileKey = change.fileId;
    let plotIndex = change.plotIndex;
    //let filesIds;
    let newWorkspaceState: any = this.state.workspaceState;
    // if (!(newWorkspaceState as any).files[fileKey]) {
    //   // so its a non-control gate being edited, copy plots from control
    //   //@ts-ignore
    //   (newWorkspaceState as any).files[fileKey] = {
    //     plots: JSON.parse(
    //       JSON.stringify(
    //         (newWorkspaceState as any).files[newWorkspaceState.controlFileId]
    //           .plots
    //       )
    //     ),
    //   };
    // }

    switch (type) {
      case "ChannelIndexChange":
        // //@ts-ignore
        // workspaceState.files[fileKey].plots[plotIndex].plotType =

        if (change.axis == "x") {
          newWorkspaceState = this.updateWorkspaceStateChannels(
            "x",
            newWorkspaceState,
            change.fileId,
            (newWorkspaceState as any).plots[plotIndex],
            change.axisIndex,
            change.axisLabel,
            change.scaleType,
            change.plotType
          );
        } else {
          newWorkspaceState = this.updateWorkspaceStateChannels(
            "y",
            newWorkspaceState,
            change.fileId,
            (newWorkspaceState as any).plots[plotIndex],
            change.axisIndex,
            change.axisLabel,
            change.scaleType,
            change.plotType
          );
        }

        break;
      case "ChangePlotType":
        newWorkspaceState.plots[plotIndex].plotType = change.plotType;

        break;

      case "ChangePlotScale":
        if (change.axis === "x") {
          newWorkspaceState.plots[plotIndex].xScaleType = change.scale;
        } else {
          newWorkspaceState.plots[plotIndex].yScaleType = change.scale;
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
    plot: any,
    axisIndex: any,
    axisLabel: any,
    scaleType: any,
    plotType: any
  ) => {
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
    let abandon = false;
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

      if (this.state.fcsFiles && this.state.fcsFiles.length > 0) {
        if (this.state.fcsFiles[0].channels.length != fcsFile.channels.length) {
          fcsFiles = [];
          this.setState({
            ...this.state,
            currentParsingFile: "",
          });
          alert(
            "Could not parse files - channels are not the same. Only upload files with the same channels"
          );
          abandon = true;
          break;
        }
      }

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
            fcsFile.events?.length +
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

    if (!abandon) {
      let workspaceState = this.state.workspaceState;

      if (
        (!workspaceState || Object.keys(workspaceState).length == 0) &&
        fcsFiles &&
        fcsFiles.length > 0
      ) {
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
        //controlFileId: this.state.controlFileId || fcsFiles[0].id,
        fcsFiles: fcsFiles,
        parsedFiles: [],
        //workspaceState: workspaceState,
      });

      if (localStorage.getItem("signup") != "true") {
        this.setState({
          ...this.state,
          userSignUpModalShowing: true,
        });
      }

      this.onInitState(workspaceState);
    }
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
      fcsFile.channels[rowI][minOrMax] = Number(newRange);
    });

    let controlEnrichedFile = this.state.enrichedFiles[0];

    //this.state.fcsFiles.forEach((fcsFile) => {
    controlEnrichedFile.channels[rowI][minOrMax] = newRange;
    //});

    this.setState({
      ...this.state,
      fcsFiles: this.state.fcsFiles,
    });
  };

  onRangeChange = (channels: any) => {
    // let controlEnrichedFile = this.state.enrichedFiles.find(
    //   (enrichedFile) => enrichedFile.isControlFile
    // );

    let files = this.state.fcsFiles;
    let workspace = this.state.workspaceState;
    files.find((file) => {
      file.channels.forEach((channel: any, index: any) => {
        channel.minimum = parseFloat(channels[index].minimum);
        channel.maximum = parseFloat(channels[index].maximum);
      });
    });

    this.setState({
      ...this.state,
      showRanges: false,
    });

    this.onInitState(this.state.workspaceState);
  };

  compCustomStyles = {
    content: {
      top: "5%",
      left: "5%",
      width: "90%",
      right: "auto",
      bottom: "auto",
      backgroundColor: "#F0AA89",
      zIndex: 1,
    },
  };

  renderTable = () => {
    let firstFile = this.state.enrichedFiles[0];

    // console.log("in renderTbake, firstFile is ", firstFile);

    if (this.state.enrichedFiles?.length > 0) {
      return (
        <>
          <Button
            variant="outlined"
            style={{
              // backgroundColor: "#6666AA",
              marginLeft: 5,
              marginBottom: 3,
              // color: "white",
            }}
            onClick={(e) => {
              let firstFile = this.state.fcsFiles[0];
              const {
                xAxisLabel,
                yAxisLabel,
                xAxisIndex,
                yAxisIndex,
                xAxisScaleType,
                yAxisScaleType,
              } = getPlotChannelAndPosition(firstFile);

              let workspaceState = createDefaultPlotSnapShot(
                firstFile.id,
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
            <Tooltip
              title={
                "Details of compensation that has been automatically applied to the samples"
              }
            >
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
            </Tooltip>
          )}
          {this.state.showSpillover && (
            <Modal
              isOpen={this.state.showSpillover}
              appElement={document.getElementById("root") || undefined}
              style={this.compCustomStyles}
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
                                  padding: 3,
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
                                      padding: 3,
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
            </Modal>
          )}

          <WorkspaceTopBar
            fcsFiles={this.state.fcsFiles}
            workspaceState={this.state.workspaceState}
            downloadPlotAsImage={this.downloadPlotAsImage}
          />
          <div id="entire-table">
            <PlotTableComponent
              isTableRenderCall={this.state.isTableRenderCall}
              enrichedFiles={this.state.enrichedFiles}
              workspaceState={this.state.workspaceState}
              className="workspace"
              onChangeChannel={this.onChangeChannel}
              onOpenFileChange={this.onOpenFileChange}
              addOverlay={this.addOverlay}
              onChangeGateName={this.onChangeGateName}
              onAddGate={this.onAddGate}
              onDeleteGate={this.onDeleteGate}
              onEditGate={this.onEditGate}
              onEditGateNamePosition={this.onEditGateNamePosition}
              onResize={this.onResize}
              sortByGate={this.sortByGate}
              downloadPlotAsImage={this.downloadPlotAsImage}
              onResetToControl={this.onResetToControl}
              testParam={this.state.testParam}
              onRangeChange={this.onRangeChange}
              onChangeColWidth={this.onChangeColWidth}
              onChangeTableDataType={this.onChangeTableDataType}
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

  handleUserSignUp = () => {
    // @ts-ignore
    const db = getFirestore(this.firebaseApp);
    localStorage.setItem("signup", "true");

    try {
      const docRef = addDoc(collection(db, "users"), {
        email: this.state.signUpEmail,
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    this.setState({
      ...this.state,
      userSignUpModalShowing: false,
    });
  };

  // async loopNumbers(firebaseApp: any) {
  //   const db = getFirestore(firebaseApp);

  //   try {
  //     const docRef = await addDoc(collection(db, "users"), {
  //     });
  //   } catch (e) {
  //     console.error("Error adding document: ", e);
  //   }
  // }

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
                  //

                  this.uploadFiles(e.target.files);
                }}
              />
              Add Files
            </Button>
            <Modal
              isOpen={this.state.userSignUpModalShowing}
              appElement={document.getElementById("root") || undefined}
              style={customStyles}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <label>
                  Sign up for latest updates about Red Matter App - the free &
                  instant flow cytometry analysis tool{" "}
                </label>
                <TextField
                  style={{
                    width: 200,
                    marginLeft: 5,
                    backgroundColor: "#fff",
                    // border: "none",
                    // borderRadius: 5,
                    // outline: "none",
                  }}
                  onChange={(e) => {
                    this.setState({
                      ...this.state,
                      signUpEmail: e.target.value,
                    });
                  }}
                />

                {/* <p style={{ height: 16, textAlign: "center", paddingTop: 2.5 }}>
                  {gateName.error && "A unique gate name is required"}
                </p> */}
                <div
                  style={{
                    padding: 10,
                    alignSelf: "center",
                    paddingTop: 0,
                    paddingBottom: 25,
                  }}
                ></div>
                <div style={{ margin: "auto" }}>
                  <Button
                    style={{
                      backgroundColor: "#6666AA",
                      color: "#fff",
                      marginRight: 5,
                      // backgroundColor:
                      //   gateName.error || !gateName.name ? "#f3f3f3" : "white",
                      // borderRadius: 5,
                      // border: "none",
                      // cursor:
                      //   gateName.error || !gateName.name ? "auto" : "pointer",
                      // color:
                      //   gateName.error || !gateName.name ? "gray" : "black",
                    }}
                    // disabled={gateName.error || !gateName.name}
                    onClick={(e) => {
                      this.handleUserSignUp();
                    }}
                  >
                    Sign Up
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "#6666AA",
                      color: "#fff",
                      // backgroundColor: "white",
                      // borderRadius: 5,
                      // border: "none",
                      // cursor: "pointer",
                    }}
                    onClick={() => {
                      localStorage.setItem("signup", "true");
                      this.setState({
                        ...this.state,
                        userSignUpModalShowing: false,
                      });
                    }}
                  >
                    Dont Sign Up
                  </Button>
                  {/* <button
                    style={{
                      backgroundColor: "white",
                      borderRadius: 5,
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => onCancelGateName()}
                  >
                    Cancel
                  </button> */}
                </div>
              </div>
            </Modal>
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
    if (this.state.workspaceState.plots) {
      // const plotGroups = getPlotGroups(getWorkspace().plots);
      return this.renderTable();
    } else {
      return this.renderUploadPanel();
    }
  }
}

export default NewPlotController;
