import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { getUserMe } from "../requests";
import GameSocketContext from "../components/Game/Context/game-socket-context";
import { Canvas } from "../components/Canvas/canvas";
import { Pong } from "../components/Pong/Pong";

export async function loader()
{
	// const res = await getUserMe()
	// return res;
}

export function Game()
{
	const {socket} = useContext(GameSocketContext).GameSocketState;
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
			setStatus('matchFound');
			setRoomState(room);
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
	}, [])

	function goBack()
	{
		setStatus('waiting');
		setError('');
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
					<Pong goBack={goBack} />
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
