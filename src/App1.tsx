import React,{useEffect, useState} from 'react';
import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './Components/Home';
import { Route, Switch } from 'react-router-dom';
import Graph from './charts/Graph';
import { fetchEventsData, fetchGraphData ,fetchParamsData,addGraph} from './Components/common/ReqHandling';
import Breadcrumbs from './Components/common/Breadcrumbs';

function App() {

    const [error,setError] = useState(false);
    const [workspacedata,setWorkspace] = useState([]);
    const [isLoading,setIsLoad] = useState(true);
    const [events,setEvents] = useState([]);
    const [params,setParams] = useState([]);

    const getGraphData = async()=>{
        const data = await fetchGraphData();
        if(data.length){
            setWorkspace(data);
            setIsLoad(false);
            localStorage.setItem('workspacedata',JSON.stringify(data));
        }else{
            setError(true);
        }
    }
    const getEventsData = async()=>{
        const data = await fetchEventsData();
        if(data.length){
            setEvents(data);
            setIsLoad(false);
            localStorage.setItem('events',JSON.stringify(data));
        }else{
            setError(true);
        }
    }

    const getParamsData = async()=>{
        const data = await fetchParamsData();
        if(data.length){
            setParams(data);
            setIsLoad(false);
            localStorage.setItem('params',JSON.stringify(data));
        }else{
            setError(true);
        }
    }

    const createGraph = async(id:string)=>{
        const data = await addGraph(id);
        if(data.status == 200 && data.data.length > 0){
            const newGraphData = data.data || [];
            setWorkspace(newGraphData);
        }
    }

    useEffect(()=>{
        getGraphData();
        getEventsData();
        getParamsData();
    },[])
    


  return (
    <>
    <Breadcrumbs onClickFun={createGraph}/>
    <Switch>
      <Route exact path="/" component={()=><Home events={events} params={params} error={error} workspacedata={workspacedata} isLoading={isLoading} /> }/>
      <Route exact path="/workspace/:workspaceId" component={()=><Graph events={events} params={params} workspacedata={workspacedata}/>}/>
    </Switch>
    </>
  );
}

export default App;
