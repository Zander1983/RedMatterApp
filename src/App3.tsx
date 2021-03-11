import Chartjs from 'chart.js';
import React, { useEffect, useState,useRef } from 'react';

const App = ()=>{
    let chartContainer:any;
    let newChartInstance:any;
    let context:any;
    chartContainer = useRef<HTMLCanvasElement>(null);
    const gatingCord = [[65,273],[27,197],[18,139],[55,119],[79,191]];
    const xstepSize = 10000;
    const ystepSize = 10000;
    const options = {
        legend:{
            display:false
        },
        scales: {
            xAxes: [{
                    gridLines: {
                        color:'red',
                        display:false
                    },
                    scaleLabel: {
                        labelString: 'Xlabel',
                        display: true
                    },
                    ticks: {
                        min:0,
                        max:250000,
                        stepSize:xstepSize,
                    },
                    display: true
                }],
            yAxes: [{
                    scaleLabel: {
                        labelString: 'Ylabel',
                        display: true
                    },
                    ticks: {
                        beginAtZero: true,
                        min:0,
                        max:250000,
                        stepSize:ystepSize,
                    },
                    gridLines: {
                        color:'green',
                        display:false
                    }
                }]
        },
        responsive: true,
        maintainAspectRatio: false,
    }
    useEffect(()=>{
        context = chartContainer.current?.getContext('2d')
        if (context) {
            let newGatingCoord:any[] = [];
            let scaleRef:any;
            newChartInstance = new Chartjs(context, {type:'scatter',
            options:options});
            gatingCord.map((data:any,index:number)=>{
                let x;
                let y;
                for (var scaleKey in newChartInstance.scales) {
                    scaleRef = newChartInstance.scales[scaleKey];
                    if (scaleRef.isHorizontal() && scaleKey == 'x-axis-1') {
                        x = scaleRef.getValueForPixel(data[1]);
                    } 
                    else if (scaleKey == 'y-axis-1') {
                        y = scaleRef.getValueForPixel(data[0]);
                    }
                }
                newGatingCoord.push([x,y])
            })
            console.log(newGatingCoord);
        }
    },[])    
    return(
        <>
            <h1>Fetching Gates cordinates</h1>
            <div className="chart-container" style={{position: 'relative', height:'401px', width:'401px'}}>
            <canvas style={{display:'none'}} id="chart" height="401px" width="401px" ref={chartContainer} ></canvas>
            </div>
        </>
    )
}
export default App;