import React, { useEffect, useState,useRef } from 'react';
import Chartjs from 'chart.js';
import { updateGraph } from '../common/ReqHandling';

const Scatter = (props:any)=>{
    const chartContainer = useRef<HTMLCanvasElement>(null);
    const [width, setWidth] = useState(props.graphData.width || 400);
    const [height, setHeight] = useState(props.graphData.height || 400);
    const [Xlabel,setXLabel] = useState(props.Xlabel)
    const [Ylabel,setYLabel] = useState(props.Ylabel)
    const [xaxis,setXAxis] = useState(props.xaxis)
    const [yaxis,setYAxis] = useState(props.yaxis)

    const xstepSize = 10000;
    const ystepSize = 10000;
    const options = {
        legend:{
            display:false
        },
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
        },
        responsive: true,
        maintainAspectRatio: false,        
        height:height,
        width:width
    }    
    const onResize = (width:number,height:number)=>{
        const context = chartContainer.current?.getContext('2d')
        if (context) {
            const newChartInstance = new Chartjs(context, {'type':"scatter",'data':{'datasets':props.chartData.datasets},'options':options});
            // if(context.canvas.parentNode){
            //     context.canvas.parentNode.style.height = height;
            // }
            // setChartInstance(newChartInstance);
        }
        const reqData = {...props.graphData,width:width,height:height};
        const url = `http://localhost:5000/graphs/${props.workspaceId}/${props.graphId}`;        
        updateGraph(url,reqData);
    }
        useEffect(()=>{
                setXLabel(props.Xlabel);
                setYLabel(props.Ylabel);
                setXAxis(props.xaxis);
                setYAxis(props.yaxis);
                $(function() {
                    $( `#${props.graphId}` ).resizable({
                        stop:(event,ui)=>{
                            const newHeight = ui.size.width;
                            const newHWidth = ui.size.height;
                            onResize(newHeight,newHWidth);
                        }
                    });
                 });
                const context = chartContainer.current?.getContext('2d')
                if (context) {
                    const newChartInstance = new Chartjs(context, {'type':"scatter",'data':{'datasets':props.chartData.datasets},'options':options});
                    // if(context.canvas.parentNode){
                    //     context.canvas.parentNode.style.height = height;
                    // }
                    // setChartInstance(newChartInstance);
                }
        })

    return (
        <>
            <div id={props.graphId} className="my-2 mx-2" style={{width:`${width}px`,height:`${height}px`,border:"1px solid black"}}>
                <canvas ref={chartContainer}></canvas>
            </div>
        </>
    )
}

export default Scatter;