import { getWorkspace2 } from "graph/utils/workspace2";
import { PolygonGate2 } from "./types";

export const getGate2 = (gateId: string): PolygonGate2 | undefined => {
  const workspace = getWorkspace2();
  for (let i = 0; i < workspace.gatingSets.length; i++) {
    for (let j = 0; j < workspace.gatingSets[i].length; j++) {
      if (workspace.gatingSets[i][j].id === gateId) {
        return workspace.gatingSets[i][j];
      }
    }
  }
  return undefined;
};
