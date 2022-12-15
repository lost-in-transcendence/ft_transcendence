import { useEffect, useRef } from "react";

export function useCanvas(props: {draw: any})
{
    const {draw} = props
    const canvasRef = useRef();
    
    useEffect(() =>
    {
        const canvas: any = canvasRef.current;
        const context = canvas?.getContext('2d');
        let animationFrameId: any;
        let frameCount: number;

        const render = () =>
        {
            frameCount++;
            draw(context, frameCount);
            animationFrameId = window.requestAnimationFrame(render);
        }
        render();
        return () =>
        {
            window.cancelAnimationFrame(animationFrameId);
        }
    }, [draw])

    return canvasRef;
}