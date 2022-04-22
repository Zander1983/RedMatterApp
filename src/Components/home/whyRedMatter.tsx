import {
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
const WhyRedMatter = () => {
  return (
    <>
      {/* Why Red Matter? */}
      <DialogTitle id="form-dialog-title">
        <div style={{ textAlign: "center" }}>Why Red Matter?</div>
      </DialogTitle>
      <DialogContent style={{ textAlign: "center" }}>
        <DialogContentText component={"p"}>
          Upload all your flow cytometry files to the cloud, making them
          accessible from anywhere.
        </DialogContentText>
        <DialogContentText component={"p"}>
          Upload all your old FlowJo workspace files - instantly bring all your
          old analysis online.
        </DialogContentText>
        <DialogContentText component={"p"}>
          Export your data directly into presentations.
        </DialogContentText>
        <DialogContentText component={"p"}>
          No dongle - unlimited number of users.
        </DialogContentText>
        <DialogContentText component={"p"}>
          Share experiments with users within and outside your organisation.
        </DialogContentText>
        <DialogContentText component={"p"}>
          Collaborate better with users within your organisation.
        </DialogContentText>
        <DialogContentText component={"p"}>
          Avail of Red Matter's user experience geared towards making flow
          cytometry analysis much more intuitive
        </DialogContentText>
        <DialogContentText component={"p"}>
          Avail of auto detection of gates.
        </DialogContentText>
        <DialogContentText component={"p"}>
          Build, reuse and share gating strategy templates .
        </DialogContentText>
      </DialogContent>
    </>
  );
};
export default WhyRedMatter;
