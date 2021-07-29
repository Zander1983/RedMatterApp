import {
  graphRenderer,
  setGraphRenderChildrenState,
} from "./engine/graphRenderer";
import { RenderMapType } from "./engine/renderManager";

const renderMap: {
  [index: string]: RenderMapType;
} = {
  graphRender: {
    children: [],
    renderMethod: graphRenderer,
    setChildrenState: setGraphRenderChildrenState,
  },
};

export default renderMap;
