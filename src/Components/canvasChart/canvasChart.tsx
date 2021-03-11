
import React, { useRef,useEffect,useState } from 'react';

import eventsData from './../../sample_data/events';
import paramsData from './../../sample_data/params';
import {graphData} from './../../sample_data/graphs';

import Canvas from './Canvas';
import { createPlotGraph } from './plot';

import { List, Select, Row, Col} from 'antd';
const { Option } = Select;
const CanvasChart = ()=>{
    const gData = graphData[0].graphs;
    const Graph = (props:any)=>{
        const [xaxis,setXaxis] = useState(props.gData.paramX);
        const [yaxis,setYaxis] = useState(props.gData.paramY);
        // const canChartRef = useRef(null);
        const handleXaxisChange = (value:any)=>{
            setXaxis(value);
        }
        const handleYaxisChange = (value:any)=>{
            setYaxis(value);
        }
        const height = props.gData.height;
        const width = props.gData.width;

        const draw = (ctx:any, frameCount:any) => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            ctx.fillStyle = '#ff0000'

            const plot = createPlotGraph(ctx, {
                x1: 50,
                y1: 10,
                x2: 481,
                y2: 411,
                ibx: 0,
                iex: 250000,
                iby: 0,
                iey: 250000
            })

            for (const point of eventsData) {
                const x = point[xaxis]
                const y = point[yaxis]
                plot.addPoint(x, y,'white')
            }
        }
        useEffect(()=>{
            console.log('axis>>>',xaxis,yaxis)
        },[xaxis,yaxis])

        return(
            <div className="main" style={{display:"flex",flexDirection:'column',margin:"10px 0",border:'1px solid black'}}>
                <div className="topPanel" style={{display:"flex",flexDirection:'row',width:'100%'}}>
                    <div className="right">
                        <Select defaultValue={xaxis} style={{ width: 120 }} onChange={handleXaxisChange}>
                            { paramsData.map((data:any,i:any)=>{
                                return(<Option value={data.key}>{data.value}</Option>)
                            }) }
                        </Select>
                    </div>
                    <div className="left">
                        {/* <canvas ref={canChartRef} height={height} width={width} style={{border:'1px solid black',background:"lightgrey"}}/> */}
                        <Canvas
                            draw={draw}
                            style={{
                            width: 541,
                            height: 471
                        }}/>
                    </div>
                </div>
                <div className="bottomPanel"style={{display:"flex",flexDirection:'row',width:'100%',marginLeft:'auto'}}>
                    <div style={{display:"flex",marginLeft:'auto'}}>
                        <Select defaultValue={yaxis} style={{ width: 120 }} onChange={handleYaxisChange}>
                            { paramsData.map((data:any,i:any)=>{
                                return(<Option key={`op${i}`} value={data.key}>{data.value}</Option>)
                            }) }
                        </Select>
                    </div>
                </div>
            </div>
        )
    }

    return(
            <div className="block workspaceBlock graphBlock">
                <div className="container-fluid">
                    <h1>Canvas Chart</h1>
                    <div style={{width:"100%",display:'flex',flexWrap: 'wrap',justifyContent: 'space-evenly'}}>
                        {
                            gData.map((data:any,index:any)=>{
                                return(
                                    <Graph key={`gr${index}`} gData={data}/>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
    )
}

export default CanvasChart;