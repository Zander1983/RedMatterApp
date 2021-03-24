import React, { useState, FC,useEffect } from 'react';

import { NavLink } from 'react-router-dom';
import { Anchor, Drawer } from 'antd';

import { UnorderedListOutlined } from '@ant-design/icons';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';

const { Link } = Anchor;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    fontFamily: 'Raleway',
    fontWeight: 700,
    color: 'white',
  },
  topBarLink: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'Raleway',
    fontWeight: 600,
    marginLeft:"10px"
  },
  toolbar: {
    backgroundColor: '#333',
    textColor: '#fafafa',
  },
}));


const AppHeader: FC = (props:any) => {
  const classes = useStyles();
  const [isLogin,setIsLogin] = useState(true);

  let user = localStorage?.getItem('user');
  let login_logout_button;

  if(user){
    login_logout_button=(
      <NavLink className={classes.topBarLink} onClick={()=>props.onLogout()} to="/">Logout</NavLink>
    )
  }else{
    login_logout_button=(
      <>
        <NavLink className={classes.topBarLink} to="/login">Sign In</NavLink>
        <NavLink className={classes.topBarLink} to="/register">Register</NavLink>
        {/* <NavLink className={classes.topBarLink} to="/authentication/0">Login</NavLink>
        <NavLink className={classes.topBarLink} to="/authentication/1">Register</NavLink> */}
      </>
    )
  }

  return (
    <AppBar className={classes.toolbar}>
      <Toolbar>
        {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton> */}
        <Typography variant="h6" className={classes.title}>
          <NavLink style={{color: '#fafafa'}} to="/">Red Matter App v2.0.1</NavLink>

          
        </Typography>
        <NavLink className={classes.topBarLink} to="/questions">Start graphing!</NavLink>
        {
          login_logout_button
        }
        {/* <NavLink className={classes.topBarLink} to="/">Home &nbsp;</NavLink>
        <NavLink className={classes.topBarLink} to="/work">Working &nbsp;</NavLink>
        <NavLink className={classes.topBarLink} to="/help">Help &nbsp;</NavLink>
        <NavLink className={classes.topBarLink} to="/contact">Contact &nbsp;</NavLink>
        <NavLink className={classes.topBarLink} to="/blog">Blog &nbsp;</NavLink>
        <NavLink className={classes.topBarLink} to="/workspaces">Workspace &nbsp;</NavLink> */}
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
