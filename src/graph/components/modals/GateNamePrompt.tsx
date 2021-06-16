import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function GetNamePrompt(props : {
    sendName : Function,
    open : boolean
}) {
    const [name, setName] = React.useState(null);

    const handleClose = () => { // setOpen(false);
    };

    return (
        <div>
            <Dialog open={
                    props.open
                }
                onClose={handleClose}
                aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Name Your Gate</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please write the name of the
                        <b> Gate </b>
                        to continue.
                    </DialogContentText>
                    <TextField autoFocus margin="dense" id="name" label="Gate Name" type="email"
                        onChange={
                            (textField : any) => {
                                setName(textField.target.value);
                            }
                        }/>
                </DialogContent>
            <DialogActions>
                <Button onClick={
                        () => props.sendName(name)
                    }
                    color="primary">
                    Continue
                </Button>
            </DialogActions>
        </Dialog>
    </div>
    );
}
