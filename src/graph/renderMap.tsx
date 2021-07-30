import { graphRenderer, setGraphRenderChildrenState } from "./graphRenderer";
import { RenderMapType } from "./engine/renderManager";

const renderMap: {
  [index: string]: RenderMapType;
} = {
  graphRenderer: {
    children: [],
    renderMethod: graphRenderer,
    setChildrenState: setGraphRenderChildrenState,
  },
};

export default renderMap;
