import { useCanvas } from "../../hooks/use-canvas";

export function Canvas (props: {draw: any, height: number, width: number})
{
    const {draw, width, height} = props;
    const canvasRef: any = useCanvas(draw);

    return <canvas ref={canvasRef} width={width} height={height} />
}