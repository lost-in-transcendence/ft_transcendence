import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { getUserMe } from "../requests";
import GameSocketContext from "../components/Game/Context/game-socket-context";
import { Canvas } from "../components/Canvas/canvas";
import { Pong } from "../components/Pong/Pong";
import { GiConsoleController } from "react-icons/gi";

export async function loader()
{
	// const res = await getUserMe()
	// return res;
}

export enum Objective
{
    TIME,
    SCORE,
}

export function Game()
{
	const {socket} = useContext(GameSocketContext).GameSocketState;
	const [status, setStatus] = useState('waiting')
	const [error, setError] = useState<string | null>(null);
	const [customGameInfo, setCustomGameInfo] = useState({
		objective: Objective.SCORE,
		goal: 5,
		invitation: false,
		invitedUser: ''
	})
	const [asSpectator, setAsSpectator] = useState(false);
	const [waitingRooms, setWaitingRooms] = useState([]);
	const [ongoingGames, setOngoingGames] = useState([]);

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
			setAsSpectator(false);
			setStatus('ongoingGame');
		});

		socket?.on('startGameAsSpectator', () =>
		{
			setError('starting game as spectator');
			setAsSpectator(true);
			setStatus('ongoingGame');
		});

		socket?.on('matchAccepted', () =>
		{
			setStatus('matchAccepted');
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
		socket?.on('games', (payload: any) =>
		{
			setOngoingGames(payload.ongoingGames);
			setWaitingRooms(payload.waitingRooms);
		});
		socket?.on('waitingRooms', (payload: any) =>
		{
			setWaitingRooms(payload.waitingRooms);
		});
		socket?.on('ongoingGames', (payload: any) =>
		{
			console.log({payload});
			setOngoingGames(payload.ongoingGames);
		});
		socket?.emit('games');
	}, [])

	function goBack()
	{
		setStatus('waiting');
		setError('');
	}

	function leaveGame()
	{
		setStatus('waiting');
		setError('');
		if (asSpectator === false)
		{
			socket?.emit('leaveGame');
		}
		else if (asSpectator === true)
		{
			socket?.emit('leaveGameAsSpectator');
		}
	}

	function customGameSubmit(e: any)
	{
		e.preventDefault();
		// const customGame = {...customGameInfo};
		// if (customGameInfo.objective === Objective.TIME)
		// 	customGame.goal *= 1000 * 60;
		socket?.emit('createCustomGame', {...customGameInfo});
	}

	return (
		<div>
			<h1>Game</h1>
			{
				status === 'matchAccepted' ?
				<>
					<p>Waiting for the other player...</p>
				</>
				:
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
					<Pong goBack={leaveGame} asSpectator={asSpectator}/>
				</>
				: status === 'customGame' ?
				<>
				<div>
					<form onSubmit={customGameSubmit}>
						<select value={customGameInfo.objective === Objective.SCORE ? 'score' : 'time'} onChange={(e) => 
						{
							let val = Objective.SCORE;
							if (e.target.value === 'score')
								val = Objective.SCORE;
							else if (e.target.value === 'time')
								val = Objective.TIME;
							setCustomGameInfo({...customGameInfo, objective: val})
						}}>
							<option value='score'>Score</option>
							<option value='time'>Time</option>
						</select>

						<select value={customGameInfo.goal} onChange={(e) => 
						{
							setCustomGameInfo({...customGameInfo, goal: Number(e.target.value)})
						}}>
							<option value='3'>3</option>
							<option value='5'>5</option>
							<option value='10'>10</option>
						</select>
						<input type="submit" value="Submit" />
					</form>
					<button onClick={goBack}>Go Back!</button>
				</div>
				</>
				: status === 'gamesList' ?
				<>
					<p>Waiting rooms:</p>
					<ul>
					{

							waitingRooms.map( (room:any) =>
						{
							if (room.invitation === false)
								return (
								<li key={room.id}>
									<div className="border-2 border-sky-500">
										<p>user: {room.user1}</p>
										<p>objective: {room.goal} {room.objective === Objective.SCORE ? "points" : "minutes"}</p>
										<button onClick={() => socket?.emit('joinCustomGame', {room: room.id})}>Join Game!!!!!</button>
									</div>
								</li>
								)
							// else if (room.invitation === true && room.invitedUser ===)
						})
					}
					</ul>
					<p>Ongoing games:</p>
					{
						ongoingGames.map((game: any) =>
						{
							return (
								<li key={game.id}>
									<div className="border-2 border-sky-800">
										<p>{game.user1} vs {game.user2}</p>
										<p>objective: {game.goal} {game.objective === Objective.SCORE ? "points" : "minutes"}</p>
										<p>time elapsed: coming soon</p>
										<button onClick={() => {socket?.emit('joinAsSpectator', {room: game.id});}}>Join as Spectator</button>
									</div>
								</li>
							)
						})
					}
					<button onClick={goBack}>Go Back!</button>
				</>
				:
				<>
					<button onClick={() => socket?.emit('quickplay')}>Quickplay</button>
					<button onClick={() => setStatus('customGame')}>Custom Game</button>
					<button onClick={() => setStatus('gamesList')}>Games List</button>
				</>

			}
			<p>{error}</p>
		</div>
	)
}
