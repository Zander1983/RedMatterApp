import React, { useState,FC } from 'react';
import { Route, Switch } from 'react-router-dom';
// import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Layout,Image } from 'antd';

import './App.css';
import 'antd/dist/antd.css';

import AppHeader from './Components/common/header';
import AppHome from './Components/home/home';
import Workspaces from './Components/workspaces/workspaces';
import WorkspaceAppFiles from './Components/workspaces/workspaceFiles';
import requestsUrl from './Components/common/RequestUrls';

const { Header, Footer,Content } = Layout;

const App: FC = () => {
    return (
        <Layout className="mainLayout">
            <Header>
                <AppHeader/>
            </Header>
            <Content>
                <Switch>
                    <Route exact path="/" component={AppHome}/>
                    <Route exact path="/workspaces" component={()=><Workspaces  url={requestsUrl.workspaceUrl}/>}/>
                    <Route exact path="/files/:workspacesId" component={({match}:any)=><WorkspaceAppFiles id={match.params.workspacesId} url={requestsUrl.fcsfilesUrl}/>}/>
                </Switch>
                {/* <AppHome/> */}
            </Content>
            {/* <Footer>
                <AppFooter/>  
            </Footer>       */}
        </Layout>
    );
    };

export default App;