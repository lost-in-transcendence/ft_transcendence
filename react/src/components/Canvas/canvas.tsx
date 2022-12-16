import { useEffect, useRef } from "react";
import { useCanvas } from "../../hooks/use-canvas";

export function Canvas (props: {draw: Function, height: number, width: number, tabIndex: number, onKeyUp: any, onKeyDown: any})
{
    const {draw, width, height, tabIndex, onKeyUp, onKeyDown} = props;
    const canvasRef: any = useCanvas(draw);

    return <canvas onKeyUp={onKeyUp} onKeyDown={onKeyDown} ref={canvasRef} tabIndex={tabIndex} width={width} height={height} />
}

// export function Canvas(props: {draw: Function, height: number, width: number})
// {
  
//     const canvasRef = useRef(null)
//     const {width, height} = props;

//     const draw = (ctx: any, frameCount: any) => {
//       ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
//       ctx.fillStyle = '#000000'
//       ctx.beginPath()
//       ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
//       ctx.fill()
//     }
    
//     useEffect(() => {
      
//       const canvas: any = canvasRef.current
//       const context = canvas?.getContext('2d')
//       let frameCount = 0
//       let animationFrameId: any
      
//       //Our draw came here
//       const render = () => {
//         frameCount++
//         draw(context, frameCount)
//         animationFrameId = window.requestAnimationFrame(render)
//       }
//       render()
      
//       return () => {
//         window.cancelAnimationFrame(animationFrameId)
//       }
//     }, [draw])
    
//     return <canvas ref={canvasRef} width={width} height={height} />
//   }