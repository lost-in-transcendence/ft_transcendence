import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { getUserMe } from "../requests";
import GameSocketContext from "../components/Game/Context/game-socket-context";
import { Canvas } from "../components/Canvas/canvas";

export async function loader()
{
	// const res = await getUserMe()
	// return res;
}

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

export function Game()
{
	const {socket} = useContext(GameSocketContext).GameSocketState;
	console.log(socket?.id);
	const [status, setStatus] = useState('waiting')
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

	const [roomState, setRoomState] = useState('');

	useEffect(() =>
	{
		socket?.on('queueing', () =>
		{
			setStatus('queueing');
		});
		socket?.on("leftQueue", () =>
		{
			setStatus('waiting');
		});
		socket?.on('exception', (payload: any) =>
		{
			console.log({payload});
		});
		socket?.on('roomReady', (payload: any) =>
		{
			const {room} = payload;
			// console.log("room found!", room);
			setStatus('matchFound');
			// socket?.emit('Room', {room});
			setRoomState(room);
			// roomNumber = room;
			// console.log("roomNumber:", roomNumber);
		});
		socket?.on('startGame', () =>
		{
			setError('starting game');
			setStatus('ongoingGame');
		});
		socket?.on('matchAccepted', () =>
		{
			setStatus('waiting');
			setError('Waiting for the other person');
		})
		socket?.on('matchDeclined', () =>
		{
			setStatus('waiting');
			setError('You declined the match');
			setRoomState('');
		});
		socket?.on('matchDeclinedByOpponent', () =>
		{
			setStatus('waiting');
			setError('Your opponent declined the match lol what a fucking loser');
			setRoomState('');
		});
		socket?.on('aborted', () =>
		{
			setStatus('waiting');
			setError('Game was aborted');
			setRoomState('');
		});
		socket?.on('disconnected', () => 
		{
			setStatus('waiting');
			setError('Someone disconnected');
			setRoomState('');
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
	}, [])

	function draw(ctx: any)
	{
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		// ctx.fillStyle = '#fff'
		// ctx.beginPath()
		// ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
		// ctx.fill()
		ctx.fillStyle = '#242424';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.strokeStyle= '#fff';
		ctx.strokeRect(0,0, ctx.canvas.width, ctx.canvas.height)

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

		ctx.fillStyle= "#fff";
		ctx.fillRect(1, gameItems.paddle1Pos, 10, paddleSize)
		ctx.fillRect(ctx.canvas.width - 10, gameItems.paddle2Pos, 10, paddleSize);
		ctx.beginPath()
		ctx.arc(gameItems.ballPos.x, gameItems.ballPos.y, ballSize / 2, 0, 2 * Math.PI);
		ctx.fill();
	}

	function handleKeyUp(e: any)
	{
		var key = e.key;
		console.log("key released:", key);
		if (key === 'w')
		{
			socket?.emit('paddleMove', {direction: 0})
		}
		if (key === 's')
		{
			socket?.emit('paddleMove', {direction: 0});
		}
	}

	function handleKeyDown(e: any)
	{
		var key = e.key;
		console.log("key pressed:", key);
		if (key === 'w')
		{
			socket?.emit('paddleMove', {direction: -1});
		}
		if (key === 's')
		{
			socket?.emit('paddleMove', {direction: 1});
		}
	}

	return (
		<div>
			<h1>Game</h1>
			{
				status === 'matchFound' ?
				<>
					<p>Match Found!!!!!!!!!!</p>
					<button onClick={() => socket?.emit('acceptMatch', {room: roomState})}>Accept</button>
					<button onClick={() => socket?.emit('declineMatch')}>Decline</button>
				</>
				: status === 'queueing' ?
				<>
					<p>In Queue...</p>
					<button onClick={() => socket?.emit("leaveQueue")}>Stop Queue</button>
				</>
				: status === 'ongoingGame' ?
				<>
					<Canvas onKeyDown={(e: any) => handleKeyDown(e)} onKeyUp={(e: any) => handleKeyUp(e)} tabIndex={0} draw={draw} height={600} width={800}></Canvas>
				</>
				:
				<>
					<button onClick={() => socket?.emit('quickplay')}>Quickplay</button>
				</>

			}
			<p>{error}</p>
		</div>
	)
}
