import CanvasComponent from './CanvasComponent'


export default class Canvas {

    canvasComponent: JSX.Element
    style: object

    constructor(draw: Function) {
        this.style = {
            width: 1000,
            height: 1000,
            backgroundColor: '#fafafa'
        }
        this.canvasComponent = <CanvasComponent 
                                    draw={draw} 
                                    style={this.style}/>
    }

    getCanvasComponent() {
        return this.canvasComponent
    }
}
