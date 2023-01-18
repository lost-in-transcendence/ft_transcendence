import { useEffect, useRef } from "react";
import { useCanvas } from "../../hooks/use-canvas";

export function Canvas (props: {draw: Function, tabIndex: number})
{
    const {draw, tabIndex} = props;
    const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> = useCanvas(draw);

    useEffect(() => {
        if (canvasRef.current) {
          canvasRef.current.focus();
        }
      }, []);

    return <canvas className="" ref={canvasRef} tabIndex={tabIndex} /*width={width} height={height} *//>
}