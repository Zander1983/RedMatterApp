import React,{useState,useEffect} from 'react';
import WorkSpaceComponent from './WorkSpaceComponent';
const WorkSp = (props:any)=>{
    const [workspdata,setWorkspdata] = useState(props.worksp);
    return(
        <div className="container-fluid">
            <div className="row">{
            workspdata.map((res:any)=>{
                return(
                    <WorkSpaceComponent key={res._id} res={res} events={props.events} params={props.params} />
                )
                }) }
            </div>
        </div>
    )  
}

export default WorkSp;