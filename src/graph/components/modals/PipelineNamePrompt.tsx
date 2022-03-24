import React, { useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function PipelineNamePrompt(props: {
  open: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  pipelines:any[],
  closeCall: {  quit: Function, save: Function};
}) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [nameError, setNameError] = React.useState(false);
  const [name, setName] = React.useState("");

  const quit = () => {
    props.setOpen(false);
  };

  useEffect(() => {
    if (props.open) {
      const inp = document.getElementById("gate-name-textinput");
      if (inp !== null) {
        inp.focus();
      } else {
        setTimeout(() => {
          const inp = document.getElementById("gate-name-textinput");
          if (inp !== null) {
            inp.focus();
          }
        }, 50);
      }
    }
  }, [props.open]);


  return (
    <div
      onKeyDown={(e: any) => {
        if (e.code === "Enter") {
          setName(name);
          // WorkspaceDispatch.ClearOpenFiles();
          // setTimeout(() => WorkspaceDispatch.ClearOpenFiles(), 1000);
        }
      }}
    >
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle>Name Your PipeLine</DialogTitle>
        <DialogContent>
          <div>
          <TextField
            error={nameError}
            value={name}
            helperText="This Field Is Required"
            autoFocus
            margin="dense"
            id="gate-name-textinput"
            label="Pipe Line Name"
            type="text"
            onChange={(e: any) => {
              setName(e.target.value);
            }}
          />
          </div>
          {/*<table style={{padding:5+'px'}}>*/}
          {/*  <thead>*/}
          {/*   <td>Name</td>*/}
          {/*  <td>Action</td>*/}
          {/*  </thead>*/}
          {/*  <tbody>*/}
          {/*  {props.pipelines?.map( (pipeline:any, index:any) => {*/}
          {/*    return(*/}
          {/*        <tr key={index} style={{padding:2+'px', margin:5+'px'}}>*/}
          {/*          <td style={{padding:2+'px', margin:1+'px'}}>{pipeline.name}</td>*/}
          {/*          <td><button style={{cursor:'pointer'}}>Set as Default</button></td>*/}
          {/*        </tr>*/}
          {/*    )*/}
          {/*  })}*/}
          {/*  </tbody>*/}
          {/*</table>*/}
        </DialogContent>
        <DialogActions>
          <Button onClick={quit} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (name === "" || name === null) {
                setNameError(true);
              } else {
                props.closeCall.save(name);
              }
            }}
            color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
