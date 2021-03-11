import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import './css/landing.css';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

import loop_analytics from '../../assets/videos/loop_analytics.mp4';

import ImgCarousel from './carousel';

const useStyles = makeStyles((theme) => ({
    mainContainer: {
        paddingTop: 40,
        paddingLeft: 100,
        paddingRight: 100,
        textAlign: 'center',
        flexDirection: 'column',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
    },
    mainDiv: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(150, 200, 200, 0.5)',
        fontFamily: 'Raleway'
    },
    card: {
        width: 600,
        flex: 1,
        backgroundColor: 'rgba(230, 240, 240, 0.99)'
    },
    centralizer: {
        display: 'grid',
        placeItems: 'center',
    },
    marginButton: {
        margin: theme.spacing(1),
        width: 300,
        height: 50,
        backgroundColor: 'rgb(255, 255, 255)',
    },
    video: {
        position: 'fixed',
        right: 0,
        bottom: 0,
        minWidth: '100%',
        minHeight: '100%',
    },
}));

const AppLandingPage = () => {
    const classes = useStyles()

    return (
        <div className="loading-page" >
            <video autoPlay muted loop className={classes.video}>
                <source src={loop_analytics} type="video/mp4"/>
            </video>
            <div className={classes.mainDiv}>
                <div className={classes.mainContainer}>
                    <div className={classes.centralizer}>
                        <Card className={classes.card} variant="outlined">
                            <CardContent>
                                <h1>
                                    <b style={{color: '#333'}}>Red Matter</b>
                                </h1>
                                <p>
                                    <b style={{color: '#777'}}>Flow Cytometry software solutions</b>
                                </p>
                                <p>Anaylising FCS files has never been easier</p>
                                {/* <ImgCarousel /> */}
                                <Button variant="outlined" size="large" color="primary" className={classes.marginButton}>
                                    <NavLink to="/questions">
                                        Start now
                                    </NavLink>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}




export default AppLandingPage;