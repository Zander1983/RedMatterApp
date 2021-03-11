import React, { useRef, useEffect } from 'react'


function useCanvas(parent, scale) {

  const canvasRef = useRef(null)

  function resizeCanvasToDisplaySize(canvas) {

    const { width, height } = canvas.getBoundingClientRect()

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width * scale
      canvas.height = height * scale
      return true
    }

    return false
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frameCount = 0
    let animationFrameId

    canvas.addEventListener('mousemove', parent.registerMouseEvent)
    canvas.addEventListener('mousedown', parent.registerMouseEvent)
    canvas.addEventListener('mouseup', parent.registerMouseEvent)
    // canvas.addEventListener('mousemove', parent.registerMouseEvent)

    const render = () => {
      frameCount++
      resizeCanvasToDisplaySize(canvas)
      // console.log(parent)
      parent.draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [parent.draw])

  return canvasRef
}


const CanvasComponent = props => {

  const { parent, scale, ...rest } = props
  const canvasRef = useCanvas(parent, scale)

  return <canvas ref={canvasRef} {...rest} />
}

export default CanvasComponent
