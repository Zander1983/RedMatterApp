import './../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import React,{useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { updateGraph } from '../common/ReqHandling';
import ScatterChart from './ScatterChart';


import axios from './../common/axios';
import './css/graph.css';

interface ParamTypes {
    workspaceId: string;
}
interface onChangedata{
    paramX:number;
    paramY:number;
    graphId:string;
    reqData:any;
}

const Graph = ({fcsfileId,workspacesId,graphsUrl,gatesUrl,eventsurl,paramsUrl}:any)=>{
    const [events,setEvents] = useState<any[]>([]);
    const [params,setParams] = useState<any[]>([]);
    const [graphs,setGraphs] = useState<any[]>([]);
    const [gates,setGates] = useState<any[]>([]);
    const [loading,setLoading] = useState<Boolean>(false);

    
    const [lableObj,setLableObj] = useState({});
    const [graphData,setGraphdata] = useState([]);
    const [noData,setIsNodata] = useState(()=>{
        if(graphData.length>0){
            return true
        }else{
            return false
        }
        }
    );

    const getEvents = async ()=>{
        try{
            setLoading(true);
            const res = await axios.get(eventsurl);
            if(res){
                setEvents(res.data);
                setLoading(false);
                return true
            }
            return false
        }catch(err){
            console.log('Error in getEvents > ',err);
            setLoading(false)
            return false
        }
    }
    const getGraphs = async ()=>{
        try{
            console.log('inside getGraphs');
            setLoading(true);
            const res = await axios.get(graphsUrl);
            if(res){
                console.log('inside getGraphs',res.data);
                setGraphs(res.data);
                setLoading(false);
                return true
            }
            return false
        }catch(err){
            console.log('Error in getGraphs > ',err);
            setLoading(false)
            return false
        }
    }
    const getGates = async ()=>{
        try{
            setLoading(true);
            const res = await axios.get(gatesUrl);
            if(res){
                setGates(res.data);
                setLoading(false);
                return true
            }
            return false
        }catch(err){
            console.log('Error in getGraphs > ',err);
            setLoading(false)
            return false
        }
    }
    const getParams = async ()=>{
        try{
            setLoading(true);
            const res = await axios.get(paramsUrl);
            if(res){
                setParams(res.data);
                setLoading(false);
                return true
            }
            return false
        }catch(err){
            console.log('Error in getParams > ',err);
            setLoading(false)
            return false
        }
    }
    useEffect(()=>{
        console.log('inside graph>>')
        if(getEvents()){
            if(getParams()){
                if(getGraphs()){
                    if(getGates()){
                        // let lb:any = {};
                        // params.map((data:any)=>{
                        //     lb[data.key] = data.value;
                        // });
                        // setLableObj(lb);
                        console.log('graphData>>>>',graphData)
                        
                    }
                }
            }
        }
        if(graphData.length>0){
            setIsNodata(false);
        }
    },[]);
    useEffect(()=>{
        let lb:any = {};
        params.map((data:any)=>{
            lb[data.key] = data.value;
        });
        setLableObj(lb);
        graphs.map((data:any)=>{
            if(data.workspaceId == workspacesId){
                setGraphdata(data.graphs);
            }
        });
        console.log('inside 2 useeffect',graphData);
    },[graphs])
    // const {workspaceId} = useParams<ParamTypes>();
    // useEffect(()=>{
        // let lb:any = {};
        // props.params.map((data:any)=>{
        //     lb[data.key] = data.value;
        // });
        // setLableObj(lb);
        // props.workspacedata.map((data:any)=>{
        //     if(data.workspaceId == workspaceId){
        //         setGraphdata(data.graphs);
        //     }
        // });
    // },[]);
    const onChangeEvent = (data:onChangedata)=>{
        // const url = `http://localhost:5000/graphs/${workspaceId}/${data.graphId}`;        
        // updateGraph(url,data.reqData);
        console.log('inside onchange')
    }
    return (
        <>
        <div className="block workspaceBlock">
            <div className="container-fluid">
                
                {loading?<h1>GraphLoading...</h1>:noData?<h1>No Data</h1>:(
                    <>
                        <div className="container-fluid">
                            <div className="row">
                            {
                                graphData.map((data:any)=>{
                                    return (
                                        <ScatterChart workspacesId={workspacesId} onChangeEvent={onChangeEvent} key={data._id} id={data._id} paramsData={params} lableData={lableObj} graphData={data} eventsData={events}/>
                                    )
                                })
                            }
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
        </>
    )
}

export default Graph;