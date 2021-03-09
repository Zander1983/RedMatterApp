/*
    This module is reponsible for dealing with all intricacies related to real
    use of flow cytometry graphs. It has the purpose of recieving data and
    providing an easy to use and intutive API for piping and representing
    graphs.
*/
import React from 'react'
import Canvas from './canvas/canvas'


interface FlowCytometryGraphInput {
    data: Array<[number, number]>,  // [{1,2}, {2,4}, ...]
    xAxis: string,                  // "FCA-A", "FTP-2", ...
    yAxis: string,                  // "FCA-A", "FTP-2", ...
    xPlotType: "lin" | "log",
    yPlotType: "lin" | "log",
}


export default class FlowCytometryGraph extends React.Component {

    canvasList: Canvas[]

    constructor(props: FlowCytometryGraphInput) {
        super(props)
        this.canvasList = [
            new Canvas((ctx: {
                beginPath: Function, moveTo: Function,
                lineTo: Function, stroke: Function
            }, frameCount: number) => {
                ctx.beginPath()
                ctx.moveTo(100, 100)
                ctx.lineTo(200, 200)
                ctx.stroke()
            })
        ]
    }

    render(): JSX.Element {
        return (
            <div>
                {
                    this.canvasList.map(
                        (canvas: Canvas) =>
                            canvas.getCanvasComponent()
                    )
                }
            </div>
        )
    }

}