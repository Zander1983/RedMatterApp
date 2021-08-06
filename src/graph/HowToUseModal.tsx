import React from "react";
import { Button } from "@material-ui/core";

import MessageModal from "./components/modals/MessageModal";

const HowToUseModal = () => {
  const [helpModal, setHelpModal] = React.useState(false);
  const handleClose = (func: Function) => {
    func(false);
  };
  const handleOpen = (func: Function) => {
    func(true);
  };

  return (
    <>
      <Button
        variant="contained"
        size="large"
        onClick={() => handleOpen(setHelpModal)}
        style={{
          marginLeft: 20,
          height: 35,
          marginTop: 5,
          backgroundColor: "#fafafa",
        }}
      >
        Learn More
      </Button>
      <MessageModal
        open={helpModal}
        closeCall={{ f: handleClose, ref: setHelpModal }}
        message={
          <div
            style={{
              overflow: "hidden",
              overflowY: "scroll",
              maxHeight: 500,
            }}
          >
            <h2>How to use?</h2>
            <div
              style={{
                width: 550,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <p>
                <b>General:</b> You may add a file by clicking the "+ Add new
                file" button. By adding a file, you will see a plot with the
                entire contents of the file you selected. You may move this plot
                around by simple clicking dragging it. You may resize by
                clicking and dragging the bottom right of a plot.
              </p>
              <p>
                <b>Main bar:</b> Located at the top of a plot, with several blue
                buttons and a red button for deleting a plot. In the right of
                this bar, you may find a camera button, which when clicked allow
                you to download the current plot as a .png picture.
              </p>
              <p>
                <b>Oval gates:</b> By pressing "Oval" you may enable oval gate
                creation (indicated by the button's color turning slightly
                lighter). To create an oval gate, click the first point where
                you want this oval gate to touch, then move your mouse up to the
                opposite point of this ellipse. After this, move your point away
                from the segment created to change the perpendicular axis'
                radius. After that, just press once again and a oval gate is
                created. To edit, just click any of the four significant points
                of the gate to adjust it.
              </p>
              <p>
                <b>Polygon gates:</b> By pressing "Polygon" you may enable
                polygon gate creation (indicated by the button's color turning
                slightly lighter). To create a polygon gate, first enable it be
                pressing the indicated button, then start clicking on the plot
                where you want the points of the polygon to be. To finish it,
                click the first point back again. The last segment of the
                polygon will be highlighted blue if the click you are about to
                make is the finishing one for closing that polygon. After a gate
                is created, you may click one of it's points to select it and
                move around as you see fit. To finish editing, just press again
                to release the point where you want it to be.
              </p>
              <p>
                <b>Subpopulations and inverse subpopulations:</b> You may create
                a subpopulation based on the current points your gates gate on a
                given plot by pressing the "Subpop" button.You may also create
                an inverse subpopulation by pressing "Inverse subpop" button.
                The inverse subpopulation selects all point outside of your
                current gates.
              </p>
              <p>
                <b>Population bar:</b> In here you may type a gate to apply to
                your current plot, or open a menu with all available gates. You
                may remove or add gates as you wish. Sometimes, if you create a
                plot as a population of another gated plot, you will not be able
                to remove that certain population.
              </p>
              <p>
                <b>Axis bar:</b> In these bars you may change the axis of the X
                or Y dimension. You may turn that dimension into a histogram by
                simple pressing the histogram button. You may change the type of
                plotting you want (linear, logicel, log...).
              </p>
              {process.env.REACT_APP_NO_WORKSPACES === "true" ? null : (
                <p>
                  <b>Sharing:</b> To share the workspace, all you have to do it
                  click the "Share Workspace button" located at the top right.
                  In there, you may find a link other people can access to see
                  your current workspace. The shared workspace is a snapshot:
                  it's immutable. As soon as you create it, it stays like that.
                  You may open a shared workspace and edit, but to see that
                  workspace again, you must create another share link. By
                  pressing the "copy" icon to the left of the link sharing
                  button, you may copy the link in a single click.
                </p>
              )}
            </div>
            <h2 style={{ marginTop: 50 }}>
              What is going to be in the full version of Red Matter?
            </h2>
            <h3>Planned features:</h3>
            <ul
              style={{
                width: 550,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <li>
                Creating reports (with medians, std. deviation, ...) as .pdf,
                .csv or .xls
              </li>
              <li>Compensation, logicel, ...</li>
            </ul>
            <h3>Long term features:</h3>
            <ul
              style={{
                width: 550,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <li>Automatic gating using artificial intelligence</li>
              <li>Red Matter's subscription with power user features</li>
            </ul>
          </div>
        }
      />
    </>
  );
};

export default HowToUseModal;
