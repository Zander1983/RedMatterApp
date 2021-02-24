import React, { useState,FC } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Layout,Image } from 'antd';
import AppHeader from './Components/common/header';
import AppHome from './Components/home/home';

const { Header, Footer,Content } = Layout;

const App: FC = () => {
    return (
        <Layout className="mainLayout">
            <Header>
                <AppHeader/>
            </Header>
            <Content>
                <AppHome/>
            </Content>
            {/* <Footer>
                <AppFooter/>  
            </Footer>       */}
        </Layout>
    );
    };

export default App;