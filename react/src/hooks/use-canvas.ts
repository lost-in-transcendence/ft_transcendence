import { useEffect, useRef } from "react";

export function useCanvas(draw: any)
{
    const canvasRef = useRef(null);
    
    useEffect(() =>
    {
        const canvas: any = canvasRef.current;
        const context = canvas?.getContext('2d');
        let animationFrameId: any;

        const render = () =>
        {
            draw(context);
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