import { graphRenderer, setGraphRenderChildrenState } from "./graphRenderer";
import {
  graphRenderer as a,
  setGraphRenderChildrenState as b,
} from "./graphRenderer2";
import { RenderMapType } from "./engine/renderManager";

const renderMap: {
  [index: string]: RenderMapType;
} = {
  graphRenderer: {
    children: ["graphRenderer2"],
    renderMethod: graphRenderer,
    setChildrenState: setGraphRenderChildrenState,
  },
  graphRenderer2: {
    children: [],
    renderMethod: a,
    setChildrenState: b,
  },
};

export default renderMap;
