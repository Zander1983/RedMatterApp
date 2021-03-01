import React, { useState,FC } from 'react';

import {NavLink} from 'react-router-dom';
import { Anchor, Drawer, Button } from 'antd';

import {UnorderedListOutlined} from '@ant-design/icons';

const { Link } = Anchor;

const AppHeader:FC = ()=>{
    const [visible, setVisible] = useState(false);

    const showDrawer = () => {
      setVisible(true);
    };
  
    const onClose = () => {
      setVisible(false);
    };
    return (
        <div className="container-fluid">
          <div className="header">
            <div className="logo">
              <a href="#">Red Matter</a>
            </div>
            <div className="mobileHidden">
              {/* <Anchor>
                  <Link href="/#home" title="Home" />
                  <Link href="/#work" title="How it works" />
                  <Link href="/#help" title="Help" />
                  <Link href="/#contact" title="Contact" />
                  <Link href="/#blog" title="Blog" />
                  <Link href="workspaces" title="My Workspace" />
              </Anchor> */}
                <NavLink activeClassName="navlink" to="/">Home &nbsp;</NavLink>
                <NavLink activeClassName="navlink" to="/#work">Working &nbsp;</NavLink>
                <NavLink activeClassName="navlink" to="/#help">Help &nbsp;</NavLink>
                <NavLink activeClassName="navlink" to="/#contact">Contact &nbsp;</NavLink>
                <NavLink activeClassName="navlink" to="/#blog">Blog &nbsp;</NavLink>
                <NavLink activeClassName="navlink" to="/workspaces">MyWorkspace &nbsp;</NavLink>
            </div>
            <div className="mobileVisible">
              <Button type="primary" onClick={showDrawer}>
                {/* <i className="fas fa-bars"></i> */}
                <UnorderedListOutlined style={{color:'#999'}}/>
              </Button>
              <Drawer
                placement="left"
                closable={false}
                onClose={onClose}
                visible={visible}
              >
                {/* <Anchor>
                  <Link href="/#home" title="Home" />
                  <Link href="/#work" title="How it works" />
                  <Link href="/#help" title="Help" />
                  <Link href="/#contact" title="Contact" />
                  <Link href="/#blog" title="Blog" />
                  <Link href="workspaces" title="My Workspace" />
                </Anchor> */}
                <NavLink activeClassName="navlink" to="/">Home &nbsp;</NavLink><br/>
                <NavLink activeClassName="navlink" to="/#work">Working &nbsp;</NavLink><br/>
                <NavLink activeClassName="navlink" to="/#help">Help &nbsp;</NavLink><br/>
                <NavLink activeClassName="navlink" to="/#contact">Contact &nbsp;</NavLink><br/>
                <NavLink activeClassName="navlink" to="/#blog">Blog &nbsp;</NavLink><br/>
                <NavLink activeClassName="navlink" to="/workspaces">MyWorkspace &nbsp;</NavLink><br/>
              </Drawer>
            </div>
          </div>
        </div>
      );
}

export default AppHeader;