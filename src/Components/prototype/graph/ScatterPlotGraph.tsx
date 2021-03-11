/*
    This module is reponsible for dealing with all intricacies related to real
    use of flow cytometry graphs. It has the purpose of recieving data and
    providing an easy to use and intutive API for piping and representing
    graphs.
*/
import React from 'react'
import ScatterPlot from './plotters/scatterPlot'


type ScatterPlotGraphInput = {
    data: Array<[number, number]>,  // [{1,2}, {2,4}, ...]
    xAxis: { key: number, value: string, display: string }
    yAxis: { key: number, value: string, display: string }
}

export default class ScatterPlotGraph extends
    React.Component<ScatterPlotGraphInput> {

    data: Array<[number, number]>
    plot: ScatterPlot

    constructor(props: ScatterPlotGraphInput) {
        super(props)

        this.data = props.data
        
        if (props.xAxis.display == 'log') {
            this.toLogAxis('x')
        }

        if (props.yAxis.display == 'log') {
            this.toLogAxis('y')
        }

        this.plot = new ScatterPlot({
            data: this.data,
            xAxis: { key: 0, value: 'x' },
            yAxis: { key: 1, value: 'y' },
        })
    }

    toLogAxis(axis: 'x' | 'y', base: number = 10) {

    }

    render(): JSX.Element {
        return (
            <div>
                <div style={{
                }}>
                    { this.plot.getCanvas() }
                </div>
            </div>
        )
    }

}