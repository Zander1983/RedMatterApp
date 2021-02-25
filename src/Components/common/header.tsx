import React, { useState,FC } from 'react';

import { Anchor, Drawer, Button } from 'antd';

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
              <Anchor>
                  <Link href="#home" title="Home" />
                  <Link href="#work" title="How it works" />
                  <Link href="#help" title="Help" />
                  <Link href="#contact" title="Contact" />
                  <Link href="#blog" title="Blog" />
                  <Link href="workspaces" title="My Workspace" />
              </Anchor>
            </div>
            <div className="mobileVisible">
              <Button type="primary" onClick={showDrawer}>
                <i className="fas fa-bars"></i>
              </Button>
              <Drawer
                placement="left"
                closable={false}
                onClose={onClose}
                visible={visible}
              >
                <Anchor>
                  <Link href="#home" title="Home" />
                  <Link href="#work" title="How it works" />
                  <Link href="#help" title="Help" />
                  <Link href="#contact" title="Contact" />
                  <Link href="#blog" title="Blog" />
                  <Link href="workspaces" title="My Workspace" />
                </Anchor>
              </Drawer>
            </div>
          </div>
        </div>
      );
}

export default AppHeader;