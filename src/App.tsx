import React, { useState,FC, useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
// import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Layout,Image } from 'antd';

import './App.css';
import 'antd/dist/antd.css';

import AppHeader from './Components/common/header';
import AppHome from './Components/home/home';
import Workspaces from './Components/workspaces/workspaces';
import AppLandingPage from './Components/home/landingPage';
import WorkspaceAppFiles from './Components/workspaces/workspaceFiles';
import requestsUrl from './Components/common/RequestUrls';
import Graph from './Components/charts/Graph';
import Questions from './Components/home/questions';

import CanvasChart from './Components/canvasChart/canvasChart';

const { Header, Footer,Content } = Layout;

const App: FC = () => {
    // let locations = useLocation();
    // const paths = locations.pathname.split('/');
    // const [isNavTransparent,setNavTransparent] = useState(false);
    
    // useEffect(()=>{
    //     if(paths.length>0 && paths[1]==""){
    //         setNavTransparent(true);
    //     }else{
    //         setNavTransparent(false);
    //     }
    // },[])
    // useEffect(()=>{
    //     console.log(locations,paths)
    // },[isNavTransparent])
    return (
        <Layout className="mainLayout">
            <Header className="default-header">
                <AppHeader/>
            </Header>
            <Content>
                <Switch>
                    {/* <Route exact path="/" component={AppHome}/> */}
                    <Route exact path="/" component={AppLandingPage}/>
                    <Route exact path="/questions" component={Questions}/>
                    {/* <Route exact path="/workspaces" component={()=><Workspaces  url={requestsUrl.workspaceUrl}/>}/> */}
                    <Route exact path="/workspaces" component={()=><CanvasChart/>}/>
                    <Route exact path="/files/:workspacesId" component={({match}:any)=><WorkspaceAppFiles id={match.params.workspacesId} url={requestsUrl.fcsfilesUrl}/>}/>
                    <Route exact path="/analyse/:workspacesId/:fcsfileId" component={({match}:any)=><Graph fcsfileId={match.params.fcsfileId} workspacesId={match.params.workspacesId} graphsUrl={requestsUrl.graphsUrl} gatesUrl={requestsUrl.gatesUrl} paramsUrl={requestsUrl.paramsUrl} eventsurl={requestsUrl.eventsUrl}/>}/>
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