import React, { useEffect, useState,useRef } from 'react';
import Chartjs from 'chart.js';
import Scatter from './Scatter';

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { useParams } from 'react-router-dom';
interface ParamTypes {
    workspaceId: string;
}
interface graphInterface{
    lableData:any;
    graphData:any;
    eventsData:any[];
    id:string;
    paramsData:any[];
    onChangeEvent:any;
    workspacesId:string;
    gates:any;
}
const ScatterChart = (props:graphInterface)=>{
    const [yaxis,setYaxis] = useState(props.graphData['paramY']);
    const [xaxis,setXaxis] = useState(props.graphData['paramX']);
    const [Xlabel,setXLabel] = useState(props.graphData['paramXName']);
    const [Ylabel,setYLabel] = useState(props.graphData['paramYName']);
    const [graphData,setGraphData] = useState(props.graphData);
    const {workspaceId} = useParams<ParamTypes>();

    let newData:any[];
    const getChartData = (x:number,y:number)=>{
        return props.eventsData.map((res,i)=>{
            return({x:res[x],y:res[y]})
        })
    }
    newData = getChartData(xaxis,yaxis);
    const [chartData,setChartData] = useState({
        "datasets":[{
            backgroundColor: "black",
            pointBorderColor: "black",
            pointBackgroundColor: "black","data":newData}]
        });
    useEffect(()=>{
        newData = getChartData(xaxis,yaxis);
        setChartData({
            "datasets":[{
                backgroundColor: "black",
                pointBorderColor: "black",
                pointBackgroundColor: "blue","data":newData}]
            })
            setXLabel(props.lableData[xaxis]);
            setYLabel(props.lableData[yaxis]);
    },[yaxis,xaxis])

    const handleXaxisChange = (event:any) => {
        const newAxis = event.target.value;
        const newAxisLable = props.lableData[newAxis];
        const newGraphData = {...graphData,paramX:newAxis,paramXName:newAxisLable}
        setGraphData(newGraphData);
        setXaxis(newAxis);
        props.onChangeEvent({reqData:newGraphData,paramX:event.target.value,graphId:props.id});
    };
    const handleYaxisChange = (event:any) => {
        const newAxis = event.target.value;
        const newAxisLable = props.lableData[newAxis];
        const newGraphData = {...graphData,paramY:newAxis,paramYName:newAxisLable}
        setGraphData(newGraphData);
        setYaxis(newAxis);
        props.onChangeEvent({paramY:event.target.value,graphId:props.id});
    };
    return(
        <>
            <div className="mx-2 my-2" style={{position: "relative", height:'fit-content', width:`fit-content`,border:'1px solid black'}}>
                <div style={{display:"flex",flexDirection:"column"}}>
                    <div style={{display:"flex",flexDirection:"row"}}>
                        <div className="mb-auto">
                            <Select
                                value={yaxis}
                                onChange={handleYaxisChange}
                                style={{marginBottom:"auto"}}
                            >
                                {
                                    props.paramsData.map((data,index)=>{
                                        return(
                                            <MenuItem key={data.key} value={data.key}>{data.value}</MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </div>
                        <Scatter workspaceId={workspaceId} graphData={graphData} graphId={graphData._id} yaxis={graphData.paramY} xaxis={graphData.paramX} Xlabel={Xlabel} Ylabel={Ylabel} chartData={chartData}/>
                        
                    </div>
                    <div className="ml-auto">
                    <Select
                        value={xaxis}
                        onChange={handleXaxisChange}
                        style={{marginLeft:"auto"}}
                    >
                        {
                            props.paramsData.map((data,index)=>{
                                return(
                                    <MenuItem key={data.key} value={data.key}>{data.value}</MenuItem>
                                )
                            })
                        }
                    </Select>
                    </div>
                </div>
            </div>
            {/* <div style={{display:"flex",flexDirection:"column"}}>
                <div className="mx-3 my-2">
                    <div style={{display:"flex",flexDirection:"row"}}>
                        <Select
                            value={yaxis}
                            onChange={handleYaxisChange}
                            style={{marginBottom:"auto"}}
                        >
                            {
                                props.paramsData.map((data,index)=>{
                                    return(
                                        <MenuItem key={data.key} value={data.key}>{data.value}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                        <div>
                            <Scatter data={chartData} options={options} height={400} width={400} />
                        </div>
                    </div>
                    <div style={{width:"100%",display:"flex"}}>
                    <Select
                        value={xaxis}
                        onChange={handleXaxisChange}
                        style={{marginLeft:"auto"}}
                    >
                        {
                            props.paramsData.map((data,index)=>{
                                return(
                                    <MenuItem key={data.key} value={data.key}>{data.value}</MenuItem>
                                )
                            })
                        }
                    </Select>
                </div>
                </div>
            </div> */}
        </>
    )
}
export default ScatterChart;