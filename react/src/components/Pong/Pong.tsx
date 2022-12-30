import { useContext, useEffect, useState } from "react";
import { Canvas } from "../Canvas/canvas";
import GameSocketContext from "../Game/Context/game-socket-context";

const gameWidth = 800;
const gameHeight = 600;
const paddleSize = 100;
const ballSize = 25;

type GameItems =
{
	paddle1Pos: number;
	paddle2Pos: number;
	ballPos: {x: number, y: number};
	player1Score: number;
	player2Score: number;
}

enum PaddleDirection
{
    UP = -1,
    STOP = 0,
    DOWN = 1,
}

function DisplayTimer(props: {timer: any, years:boolean, hours:boolean, minutes: boolean, seconds: boolean})
{
    const {timer} = props;
    let years, hours, minutes, seconds;
    let timerstr = '';
    if (props.years === true)
    {
        years = Math.floor(timer / (60 * 60 * 24))
        timerstr += years;
    }
    if (props.hours === true)
    {
        hours = Math.floor((timer / (60 * 60)) % 24),
        timerstr += (hours < 10 ? `0${hours}` : hours);
    }
    if (props.minutes === true)
    {
        minutes = Math.floor((timer / 60) % 60);
        timerstr += (minutes < 10 ? `0${minutes}` : minutes);
    }
    if (props.seconds === true)
    {
        seconds = Math.floor((timer % 60));
        timerstr += ':' + (seconds < 10 ? `0${seconds}` : seconds);
    }

    return <p>{timerstr}</p>
}

export function Pong(props: {goBack: any, asSpectator: boolean})
{
    const {goBack, asSpectator} = props;
    const {socket} = useContext(GameSocketContext).GameSocketState;
    const [showEndScreen, setShowEndScreen] = useState(false);
    const [endScreen, setEndScreen] = useState({winner: '', loser: '', draw: false, reason: ''})
    const [status, setStatus] = useState('playing');
    const [error, setError] = useState<string | null>(null);
    const [gameItems, setGameItems] = useState<GameItems>(
		{
			paddle1Pos: Math.round((gameHeight / 2) - paddleSize / 2),
			paddle2Pos: Math.round((gameHeight / 2) - paddleSize / 2),
			ballPos:
			{
				x: gameWidth / 2, 
				y: gameHeight / 2
			},
			player1Score: 0,
			player2Score: 0,
		})
	
	const [timer, setTimer] = useState(0);

	useEffect( () =>
	{
		const interval = setInterval(() => 
			{
				if (showEndScreen === false)
				{
					setTimer((prev) => {return prev + 1});
				}
			}, 1000);
		return () => {clearInterval(interval)};
	}, [showEndScreen]);

    useEffect(() =>
    {
		socket?.on('disconnected', () => 
		{
			setStatus('playerDisconnected');
			setError('Someone disconnected');
		});
		socket?.on('renderFrame', (payload: any) =>
		{
			setGameItems(
				{
					...gameItems,
					paddle1Pos: payload.paddle1Pos,
					paddle2Pos: payload.paddle2Pos,
					ballPos: payload.ballPos,
					player1Score: payload.player1Score,
					player2Score: payload.player2Score,
				});
		});
        socket?.on('endGame', (payload:any) =>
        {
            const {winner, loser, draw, reason} = payload;
            setEndScreen({...endScreen, winner, loser, draw, reason})
            setShowEndScreen(true);
        })

        return () =>
        {
            socket?.off('disconnected');
            socket?.off('renderFrame');
        }
    })

    function drawGame(ctx: any)
	{
        // background
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		ctx.fillStyle = '#242424';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // outline
		ctx.strokeStyle= '#fff';
		ctx.strokeRect(0,0, ctx.canvas.width, ctx.canvas.height)

        // middle line
		ctx.strokeStyle = "#fff";
		ctx.setLineDash([10]);
		ctx.beginPath();
		ctx.moveTo(gameWidth / 2,0);
		ctx.lineTo(gameWidth / 2, gameHeight);
		ctx.stroke();

		// score
		ctx.font = "30px Orbitron";
		ctx.fillStyle = "#888";
		ctx.fillText(gameItems.player1Score,((gameWidth/2)/2),100);
		ctx.fillText(gameItems.player2Score,((gameWidth/2)*1.5),100);

		// display names
		ctx.fillText('player 1',((gameWidth/2)/2) - 30,40);
		ctx.fillText('player 2',((gameWidth/2)*1.5) - 30,40);

        // paddles
		ctx.fillStyle= "#fff";
		ctx.fillRect(1, gameItems.paddle1Pos, 10, paddleSize)
		ctx.fillRect(ctx.canvas.width - 10, gameItems.paddle2Pos, 10, paddleSize);

        // ball
		ctx.beginPath()
		ctx.arc(gameItems.ballPos.x, gameItems.ballPos.y, ballSize / 2, 0, 2 * Math.PI);
		ctx.fill();
	}

	function handleKeyUp(e: any)
	{
		if (asSpectator === true)
			return;
		var key = e.key;
		if (key === 'w')
		{
			socket?.emit('paddleMove', {direction: PaddleDirection.STOP})
		}
		if (key === 's')
		{
			socket?.emit('paddleMove', {direction: PaddleDirection.STOP});
		}
	}

	function handleKeyDown(e: any)
	{
		if (asSpectator === true)
			return ;
		var key = e.key;
		if (key === 'w')
		{
			socket?.emit('paddleMove', {direction: PaddleDirection.UP});
		}
		if (key === 's')
		{
			socket?.emit('paddleMove', {direction: PaddleDirection.DOWN});
		}
	}

    return(
        <>
			<DisplayTimer timer={timer} years={false} hours={false} minutes={true} seconds={true}/>
            <Canvas onKeyDown={(e: any) => handleKeyDown(e)} onKeyUp={(e: any) => handleKeyUp(e)} tabIndex={0} draw={drawGame} height={600} width={800}></Canvas>
            {
                showEndScreen ?
                <EndScreen winner={endScreen.winner} loser={endScreen.loser} draw={endScreen.draw} reason={endScreen.reason} />
                :
                <></>
            }
			<button onClick={goBack}>Go Back</button>
        </> 
    )
}

export function EndScreen(props: {winner: string, loser: string, draw: boolean, reason: string})
{
    const {winner, loser, draw, reason} = props;

    let title, content;
    if (draw)
    {
        title = "Draw";
        content = "You both suck lol";
    }
    else
    {
        title = `${winner} wins!`
        content = `${loser} sucks lol`
    }

    return (
        <div>
            <h2>{title}</h2>
            <p>{content}</p>
            <p>{reason}</p>
        </div>
    )
}