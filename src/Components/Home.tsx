import React,{useEffect, useState} from 'react';
import WorkSp from './WorkSp';

const Home = (props:any)=>{
    if(props.workspacedata.length){
        return(
            <>
                <WorkSp params={props.params} events={props.events} worksp={props.workspacedata}/>
            </>
        )
    }else if(props.isLoading){
        return(
            <h1>Loading.....</h1>
        )
    }else if(props.error){
        return(
            <h1>Error will fetching data... Please Retry</h1>
        )
    }else{
        return(<h1>No Data</h1>)   
    }
}

export default Home;