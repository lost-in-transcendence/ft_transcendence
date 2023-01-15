import { useEffect, useRef } from "react";

export function useCanvas(draw: any)
{
    const canvasRef = useRef(null);
    
    useEffect(() =>
    {
        const canvas: any = canvasRef.current;
        const context = canvas?.getContext('2d');
        let animationFrameId: any;

        function updateDimensions()
        {
            canvas.width = window.innerWidth * 75 / 100;
            canvas.height = window.innerHeight * 66 / 100;
        }

        updateDimensions();

        window.addEventListener('resize', updateDimensions);

        const render = () =>
        {
            draw(context);
            animationFrameId = window.requestAnimationFrame(render);
        }
        render();

        return () =>
        {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', updateDimensions);
        }
    }, [draw])

    return canvasRef;
}