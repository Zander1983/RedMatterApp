import React, { useEffect, useRef, useState } from 'react';
import Chartjs from 'chart.js';
import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
// import ResizableBox from 'react-resizable-component';
// import { Resizable, ResizableBox } from 'react-resizable';
// import { $ }  from 'react-jquery-plugin';
// const { JSDOM } = require( "jsdom" );
// const { window } = new JSDOM( "" );
// const $ = require( "jquery" )( window );
// import "./../node_modules/jquery-resizable/resizable.css";
// import "./../node_modules/jquery-resizable/resizable.js";
// import $ from "jquery";
// const Resizable = require('react-resizable').Resizable;
// const ResizableBox = require('react-resizable').ResizableBox;
// const ResizableBox = require('react-resizable-component');

const chartConfig = {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        responsive: true,
        maintainAspectRatio: false,
        height:500,
        width:300
    }
};
const Chart = () => {
    const chartContainer = useRef<HTMLCanvasElement>(null);
    const [chartInstance, setChartInstance] = useState(null);
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(400);
  
    useEffect(() => {
        $(function() {
            $( "#resizable" ).resizable({
                stop:(event,ui)=>{
                    console.log('Stopped');
                    console.log('event=>',event);
                    console.log('width=>',ui.size.width);
                    console.log('height=>',ui.size.height);
                }
            });
         });
        const context = chartContainer.current?.getContext('2d')
        if (context) {
            const newChartInstance = new Chartjs(context, chartConfig);
            // if(context.canvas.parentNode){
            //     context.canvas.parentNode.style.height = height;
            // }
            // setChartInstance(newChartInstance);
        }
    }, [width,height]);
    function incWid(){
        setWidth((prev)=>{
            return prev+100
        })
    }
    const decWid = ()=>{
        setWidth((prev)=>{
            return prev-100
        })
    }

    function incHgt(){
        setHeight((prev)=>{
            return prev+100
        })
    }
    const decHgt = ()=>{
        setHeight((prev)=>{
            return prev-100
        })
    }
    let style = {
        width: '100%',
        height: '100%'
      };
  
    return (
    <div className="bg-danger mx-1" style={{position: "relative", height:'fit-content', width:`fit-content`,border:'1px solid black'}}>
        <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",flexDirection:"row"}}>
                <div className="mb-auto">
                    <button className="btn btn-info" onClick={incHgt}>Increase</button>
                    <button className="btn btn-info" onClick={decHgt}>Decrease</button>
                </div>
                <div id="resizable" className="bg-warning my-2 mx-2" style={{width:`${width}px`,height:`${height}px`}}>
                    <canvas ref={chartContainer}></canvas>
                </div>
                
            </div>
            <div className="ml-auto">
                <button className="btn btn-info" onClick={incWid}>Increase</button>
                <button className="btn btn-info" onClick={decWid}>Decrease</button>
            </div>
        </div>
    </div>
    );
}; 

function App(){
    return(
        <>
        <h1>Hello</h1>
        <Chart/>
        </>
    )
}
export default App;




