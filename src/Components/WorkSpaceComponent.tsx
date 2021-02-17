import React from 'react';
import {Link} from 'react-router-dom';
const WorkSpaceComponent = (props:any)=>{    
    return(
        <>
            <div className="col-md-3 mx-2 my-2">
                <div className="row">
                    <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <p>WorkspaceId : {props.res.workspaceId}</p>
                            <Link className="btn btn-info" to={`/workspace/${props.res.workspaceId}`}>Show Chart</Link>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default WorkSpaceComponent;