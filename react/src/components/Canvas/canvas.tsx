import { useEffect, useRef } from "react";
import { useCanvas } from "../../hooks/use-canvas";

export function Canvas (props: {draw: Function, tabIndex: number, onKeyUp: any, onKeyDown: any})
{
    const {draw, tabIndex, onKeyUp, onKeyDown} = props;
    const canvasRef: any = useCanvas(draw);

    return <canvas className="" onKeyUp={onKeyUp} onKeyDown={onKeyDown} ref={canvasRef} tabIndex={tabIndex} /*width={width} height={height} *//>
}