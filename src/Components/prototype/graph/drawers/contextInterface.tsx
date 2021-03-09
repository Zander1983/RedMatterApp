/*
    This is responsible for defing the most important reference to a canvas:
    it's context. It's so important the it has it's own file, to be imported
    anywhere that is needed.

    NOTE: Importing this outside of this folder is strictly prohibited, as it
    should never be part of any external API not available on "drawers".
*/
export default interface CanvasContext {
    // Parameters
    fillStyle: string
    strokeStyle: string
    font: string
    lineWidth: number

    // Methods
    beginPath: Function
    moveTo: Function
    lineTo: Function
    stroke: Function
    fillText: Function
    fill: Function
    arc: Function
}