import React,{useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { updateGraph } from '../common/ReqHandling';
import ScatterChart from './ScatterChart';

interface ParamTypes {
    workspaceId: string;
}
interface onChangedata{
    paramX:number;
    paramY:number;
    graphId:string;
}

const Graph = (props:any)=>{
    const {workspaceId} = useParams<ParamTypes>();
    const [lableObj,setLableObj] = useState({});
    const [graphData,setGraphdata] = useState([])
    useEffect(()=>{
        let lb:any = {};
        props.params.map((data:any)=>{
            lb[data.key] = data.value;
        });
        setLableObj(lb);
        props.workspacedata.map((data:any)=>{
            if(data.workspaceId == workspaceId){
                setGraphdata(data.graphs);
            }
        });
    },[]);
    const onChangeEvent = (data:onChangedata)=>{
        let qryString:string = '';
        if(data.paramX != undefined){
            if(qryString == ''){
                qryString = `${qryString}paramX=${data.paramX}`;
            }else{
                qryString = qryString+'&paramX='+data.paramX;
            }
        }
        if(data.paramY != undefined){
            if(qryString == ''){
                qryString = `${qryString}paramY=${data.paramY}`;
            }else{
                qryString = qryString+'&paramY='+data.paramY;
            }
        }
        const url = `http://localhost:5000/graphs/${workspaceId}/${data.graphId}?${qryString}`;        
        // updateGraph(url);
    }
    return (
        <>
        <div className="container-fluid">
            <div className="row">
            {
                graphData.map((data:any)=>{
                    return (
                        <>
                        <ScatterChart onChangeEvent={onChangeEvent} key={data._id} id={data._id} paramsData={props.params} lableData={lableObj} graphData={data} eventsData={props.events}/>
                        </>
                    )
                })
            }
            </div>
        </div>
        </>
    )
}

export default Graph;