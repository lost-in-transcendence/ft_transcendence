import { useEffect, useMemo, useRef } from "react";
import { debounce } from "../components/utils/debounce";

export function useCanvas(draw: any)
{
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const updateDimensions = useMemo(() => debounce(() =>
    {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 75 / 100;
        canvas.height = window.innerHeight * 66 / 100;
    }, 250),
    [window.innerWidth, window.innerHeight]);

    useEffect(() =>
    {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (canvas)
        {
            canvas.width = window.innerWidth * 75 / 100;
            canvas.height = window.innerHeight * 66 / 100;
        }
    }, [])

    useEffect(() =>
    {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        const context = canvas?.getContext('2d');
        let animationFrameId: any;

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