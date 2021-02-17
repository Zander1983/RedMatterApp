import React, { useEffect, useState } from 'react';
import {Scatter} from "react-chartjs-2";

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { useParams } from 'react-router-dom';

interface graphInterface{
    lableData:any;
    graphData:any;
    eventsData:any[];
    id:string;
    paramsData:any[];
    onChangeEvent:any;
}
const ScatterChart = (props:graphInterface)=>{
    const [yaxis,setYaxis] = useState(props.graphData['paramY']);
    const [xaxis,setXaxis] = useState(props.graphData['paramX']);
    const [Xlabel,setXLabel] = useState(props.graphData['paramXName'])
    const [Ylabel,setYLabel] = useState(props.graphData['paramYName'])
    // const {workspaceId} = useParams()
    const xstepSize = 10000;
    const ystepSize = 10000;
    const options = {
        legend:{
            display:false
        },
        responsive:true,
        scales: {
            xAxes: [{
                    scaleLabel: {
                        labelString: Xlabel,
                        display: true
                    },
                    ticks: {
                        stepSize:xstepSize,
                    },
                    gridLines: {
                        display: false
                    },
                    display: true
                }],
            yAxes: [{
                    scaleLabel: {
                        labelString: Ylabel,
                        display: true
                    },
                    ticks: {
                        // beginAtZero: true,
                        // max: 250000,
                        // min:0,
                        stepSize:ystepSize,
                        // maxTicksLimit:250000
                    },
                    gridLines: {
                        display: false
                    }
                    // display: false
                }]
        }
    }
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
        setXaxis(event.target.value);
        props.onChangeEvent({paramX:event.target.value,graphId:props.id});
    };
    const handleYaxisChange = (event:any) => {
        setYaxis(event.target.value);
        props.onChangeEvent({paramY:event.target.value,graphId:props.id});
    };
    return(
        <>
            <div style={{display:"flex",flexDirection:"column"}}>
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
            </div>
        </>
    )
}
export default ScatterChart;