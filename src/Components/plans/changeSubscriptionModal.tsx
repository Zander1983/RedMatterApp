import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function ChangeSubscriptionModal(props : {
    updateSubscription : Function,
    open : boolean,
    subscription : String,
    subSelect : any,
    close : Function,
    refresh : Function
}) {

    const handleClose = () => { // setOpen(false);
    };

    return (
        <div>
            <Dialog open={
                    props.open
                }
                onClose={handleClose}
                aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Update Subscription</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to change your subscription?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={
                            () => {
                                props.close();
                            }
                        }
                        color="primary">
                        Cancel
                    </Button>
                    <Button onClick={
                            () => {
                                props.updateSubscription(props.subSelect);
                                props.refresh()
                            }
                        }
                        color="primary">
                        Update Subscription
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
