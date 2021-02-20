import React, { useEffect, useState,useRef } from 'react';
import Chartjs from 'chart.js';

const App= ()=>{
    let chartContainer:any;
    let context:any;
    chartContainer = useRef<HTMLCanvasElement>(null);
    const [createPoly,setCreatePoly] = useState(false);
    const [polyArray,setPolyArray] = useState([]);
    const [order,setOrder] = useState(1);
    // const [tempPoly,setTempPoly] = useState<any[]>([]);
    let tempPoly:any[] = [];
    const points = [
        {x:1,y:2},
        {x:2,y:2},
        {x:3,y:9},
        {x:1,y:6},
        {x:4,y:8},
        {x:4,y:1},
        {x:6,y:5}
    ]
    const config = {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Scatter Dataset1',
                // fill:false,
                // showLine:true,
                // borderColor:'red',
                // borderWidth:0.9,
                // backgroundColor:'rgba(255,24,12,0.5)',
                order:order,
                pointBackgroundColor:'white',
                pointBorderWidth:0,
                pointRadius:2,
                tooltips: {enabled: false},
                hover: {mode: null},
                // spanGaps:true,
                data: points,
            }]
        },
        options: {
            elements: {
                line: {
                    tension: 0
                }
            },
            legend:{
                display:false,
            },
            responsive:true,
            maintainAspectRatio:false,
            scales: {
                xAxes: [{
                    stacked:true
                }],
                yAxes: [{
                    stacked: true
                }]
            },
            onClick:(event:any)=>{
                drawPolygon(event);
            }
        }
    }

    let newChartInstance:any;
    function ourClickHandler(element:any) {
        let scaleRef:any;
        let valueX:any;
        let valueY:any;
        for (var scaleKey in newChartInstance.scales) {
            scaleRef = newChartInstance.scales[scaleKey];
            if (scaleRef.isHorizontal() && scaleKey == 'x-axis-1') {
                valueX = scaleRef.getValueForPixel(element.offsetX);
            } else if (scaleKey == 'y-axis-1') {
                valueY = scaleRef.getValueForPixel(element.offsetY);
            }
        }
        return [valueX,valueY]
        // if (valueX > newChartInstance.scales['x-axis-1'].min && valueX < newChartInstance.scales['x-axis-1'].max && valueY > newChartInstance.scales['y-axis-1'].min && valueY < newChartInstance.scales['y-axis-1'].max) {
        //     newChartInstance.data.datasets.forEach((dataset:any) => {
        //         dataset.data.push({
        //             x: valueX,
        //             y: valueY,
        //             extraInfo: 'info'
        //         });
        //     });
        //     newChartInstance.update();
        // }
    }
    const drawPolygon = (result:any)=>{
        // if(result.which == 3){
        //     if(createPoly){
        //         if(tempPoly.length>0){
        //             if(tempPoly[0] == tempPoly[tempPoly.length-1]){
        //                 setCreatePoly(false)
        //             }else{
        //                 console.log('Select First Point to close loop of polygon');
        //             }
        //         }else{
        //             console.log('Left click to add poly points');
        //         }
        //     }else{
        //         setCreatePoly(true);
        //     }
        // }
        if(result.which == 1 && createPoly){
            const [x,y] = ourClickHandler(result);
            
            if(tempPoly.length > 3){
                const first_x = tempPoly[0][0];
                const first_y = tempPoly[0][1];
                if((Math.abs(x-first_x) <0.05 ) && (Math.abs(y-first_y)) < 0.05){
                    tempPoly = [...tempPoly,[first_x,first_y]];
                }else{
                    tempPoly = [...tempPoly,[x,y]];
                }
            }else{
                tempPoly = [...tempPoly,[x,y]];
            }
            
            if(x > newChartInstance.scales['x-axis-1'].min && x < newChartInstance.scales['x-axis-1'].max && y > newChartInstance.scales['y-axis-1'].min && y < newChartInstance.scales['y-axis-1'].max) {
                // newChartInstance.data.datasets.forEach((dataset:any) => {
                //     dataset.data.push({
                //         x: x,
                //         y: y,
                //         extraInfo: 'info'
                //     });
                // });
                
                newChartInstance.data.datasets[order-1].data.push({
                        x: x,
                        y: y,
                        extraInfo: 'info'
                    });
                newChartInstance.update();
            }
        }
        
    }
    useEffect(()=>{
        context = chartContainer.current?.getContext('2d')
        
        if (context) {
            newChartInstance = new Chartjs(context, config);
            chartContainer.current.onmousedown = function(result:any) {
                if(order>1){
                    const polyDataset = {
                        label: `poly${order}`,
                        fill:false,
                        showLine:true,
                        borderColor:'red',
                        borderWidth:0.9,
                        backgroundColor:'rgba(255,24,12,0.5)',
                        order:order,
                        pointBackgroundColor:'red',
                        pointBorderWidth:0,
                        pointRadius:2,
                        // spanGaps:true,
                        data: [],
                    };
                    newChartInstance.data.datasets.push(polyDataset);
                }
                /*
                Right click is 3
                Left click is 1
                */
            //    console.log('qwertt>>>',result.which)
            //    console.log('createPoly>>>',createPoly)
               if(result.which == 3){
                   if(createPoly){
                        if(tempPoly.length>0){
                            if(tempPoly[0] == tempPoly[tempPoly.length-1]){
                                setCreatePoly(false)
                            }else{
                                console.log('Select First Point to close loop of polygon');
                            }
                        }else{
                            console.log('Left click to add poly points');
                        }
                   }else{
                        setOrder(prev=>prev+1);
                        setCreatePoly(true);
                   }
               }
            //    if(result.which == 1 && createPoly){
            //        const [x,y] = ourClickHandler(result);
            //        tempPoly = [...tempPoly,[x,y]];
            //     }
            //     console.log(tempPoly);
            };
        }
    },[createPoly]);

    return(
        <>
            <h1>Dummy Chart</h1>
            <div className="chart-container" style={{position: 'relative', height:'40vh', width:'80vw'}}>
                <canvas id="chart" style={{background:'black'}} ref={chartContainer} width='400px' height="400px"></canvas>
            </div>
        </>
    )
}

export default App;