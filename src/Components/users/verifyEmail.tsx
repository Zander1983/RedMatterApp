import React,{useState,useEffect} from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios';

import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles,Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
}));

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const VerifyEmail = (props:any)=>{
    
    const history = useHistory();
    const classes = useStyles();
    // const [open, setOpen] = React.useState(false);
    const [msg,setMsg] = useState('');
    
    const [isError,setError] = useState(false);
    const [isSuccess,setSuccess] = useState(false);

    useEffect(()=>{
        console.log('Renering...')
    },[]);

    const verify = async () => {
        try{
            const res = await axios.get(`/api/verify?verifyStr=${props.verifyStr}`);
            console.log('verify message>>>',res)
            const resMsg = res.data.message;
            setError(false);
            setSuccess(true)
            setMsg(resMsg);
            setTimeout(()=>{
                history.push('/login')
            },4000)
        }catch(err:any){
            console.log('hjhkjhkjhjk',err)
            const resMsg = "Error while verifying.Please try after some time!"
            setError(true);
            setSuccess(false)
            setMsg(resMsg);
        }
    };
    
    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        if(isError){
            setError(false);
        }else if(isSuccess){
            setSuccess(false)
        }
    };
    return(
        <>
        <div className={classes.root}>
            <Snackbar open={isError || isSuccess} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={isError?"error":"success"}>
                {msg}
                </Alert>
            </Snackbar>
        </div>
        <Container fixed>
            <div className={classes.container}>
                <h1>Welcome To Red Matter</h1>
                <p>Thanks for choosing RedMatter.</p>
                <p>We're excited to have you get started. Please verify your account by clicking the button below.</p>
                
                <Button variant="contained" color="primary" onClick={verify}>
                    Verify Email
                </Button>
            </div>            
        </Container>
        </>
    )
}

export default VerifyEmail;