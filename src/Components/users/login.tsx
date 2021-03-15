import React,{useState,useRef} from 'react';
import axios from 'axios';
import { makeStyles } from "@material-ui/core/styles";


import {Avatar, Grid, Paper} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Button from '@material-ui/core/Button';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';

import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    paperStyle : {
        padding:"10px",
        height:"70vh",
        width:"450px",
        margin:"20px auto"
    },
    avatarStyle:{
        background:"#00dffffc"
    },
    root: {
        width: '100%',
        '& > * + *': {
          marginTop: theme.spacing(2),
        },
    },
    textFieldWidth:{
        width:"75%"
    }
}));

const Login = (props:any)=>{
    const classes = useStyles();
    const loginForm = useRef();
    const [isError, setError] = React.useState(false);
    const [isSuccess, setSuccess] = React.useState(false);

    const [formData,setFormData] = useState({
        email: '',
        password: '',
    })
 
    const [isSubmit,setIsSubmit] = useState(false);

    const handleChange = (event:any) => {
        setFormData((prevData:any)=>{
            return {...prevData,[event.target.name]:event.target.value}
        })
    }

    const handleSubmit = async () => {
        try{
            const res = await axios.post("http://integration6.eba-mdppjui3.us-east-1.elasticbeanstalk.com/api/login",formData);
            const loginData = res.data;
            setError((prev:any)=> false)
            setSuccess((prev:any)=> true)
            localStorage.setItem('token',loginData.token)
            localStorage.setItem('organisationId',loginData.userDetails.organisationId)
            props.handleAfterLogin();
            props.history.push('/workspaces');
        }catch(err){
            setError((prev:any)=> true)
            setSuccess((prev:any)=> false)
        }
    }
    return(
        <>        
            <Grid>
                <Paper elevation={10} className={classes.paperStyle}>
                    <Grid align="center">
                        <div className={classes.root}>
                            <Collapse in={isError}>
                                <Alert
                                    severity="error"
                                    action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setError(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                    }
                                >
                                    Invalid Email or Password!!!
                                </Alert>
                            </Collapse>

                            <Collapse in={isSuccess}>
                                <Alert
                                    severity="success"
                                    action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setSuccess(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                    }
                                >
                                    Successfully Logged In
                                </Alert>
                            </Collapse>
                        </div>
                        <Avatar className={classes.avatarStyle}><LockOutlinedIcon/></Avatar>
                        <h2>Sign In</h2>
                        <div>
                           <ValidatorForm
                                ref={loginForm}
                                onSubmit={handleSubmit}
                            >
                                <TextValidator
                                    className = {classes.textFieldWidth}
                                    label="Email"
                                    onChange={handleChange}
                                    name="email"
                                    value={formData.email}
                                    validators={['required', 'isEmail']}
                                    errorMessages={['Email is required!!!', 'Email is not valid']}
                                />
                                <br />
                                <TextValidator
                                    className = {classes.textFieldWidth}
                                    label="Password"
                                    type="password"
                                    onChange={handleChange}
                                    name="password"
                                    value={formData.password}
                                    validators={['required']}
                                    errorMessages={['Password is required']}
                                />
                                <br />
                                <Button
                                    color="primary"
                                    variant="contained"
                                    type="submit"
                                    disabled={isSubmit}
                                >
                                    {
                                        (isSubmit && 'Your form is submitted!')
                                        || (!isSubmit && 'Submit')
                                    }
                                </Button>
                            </ValidatorForm>
                        </div>
                    </Grid>
                </Paper>
            </Grid>
        </>
    )
}

export default Login;