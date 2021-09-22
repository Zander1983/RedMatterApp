import React from "react";
import { resetPlotSizes } from "./components/workspaces/WorkspaceCanvasController";

const SmallScreenNotice = () => {
  const [resizeListener, setResizeListener] = React.useState(false);
  const [showSmallScreenNotice, setShowSmallScreenNotice] = React.useState(
    window.innerWidth < 1165
  );
  if (!resizeListener) {
    setResizeListener(true);
    window.addEventListener("resize", () => {
      setShowSmallScreenNotice(window.innerWidth < 1165);
      resetPlotSizes();
    });
  }

  return showSmallScreenNotice ? (
    <div
      style={{
        color: "#555",
        backgroundColor: "#fdd",
        padding: 20,
        paddingBottom: 1,
        paddingTop: 15,
        marginTop: -10,
        textAlign: "center",
      }}
    >
      <p>
        <b>We noticed you are using a small screen</b>
        <br />
        Unfortunately, Red Matter is made with Desktop-sized screens in mind.
        Consider switching devices!
      </p>
    </div>
  ) : null;
};

export default SmallScreenNotice;
