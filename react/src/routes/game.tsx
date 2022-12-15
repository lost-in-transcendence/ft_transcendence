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

export function Game()
{
	const {socket} = useContext(GameSocketContext).GameSocketState;
	console.log(socket?.id);
	const [status, setStatus] = useState('waiting')
	const [error, setError] = useState<string | null>(null);

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
			setError('Your opponent has disconnected');
			setRoomState('');
		});

	}, [])

	function draw(ctx: any, frameCount: any)
	{
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		ctx.fillStyle = '#000000'
		ctx.beginPath()
		ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
		ctx.fill()
	  }

	// const user: any = useLoaderData();
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
					<Canvas draw={draw} height={600} width={800}></Canvas>
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
