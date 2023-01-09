import { useContext, useEffect, useState } from "react";
import { useLoaderData, useLocation } from "react-router-dom";
import { getAllUsersSelect } from "../requests";
import GameSocketContext from "../components/Game/Context/game-socket-context";
import { Pong } from "../components/Pong/Pong";
import SocketContext from "../components/Socket/socket-context";
import { GameStatus } from "../dto/game.dto";
import { Accordeon } from "../components/Menu/Accordeon"

export async function loader()
{
	const res = await getAllUsersSelect(new URLSearchParams(
		{
			'id': 'true',
			'userName': 'true',
			'status' : 'true'
		}
	));
	return res;
}

export enum Objective
{
    TIME,
    SCORE,
}


export function Game()
{
	const loaderData: any = useLoaderData();
	const {socket} = useContext(GameSocketContext).GameSocketState;
	const masterSocket = useContext(SocketContext).SocketState.socket;
	const [status, setStatus] = useState('waiting')
	const [error, setError] = useState<string | null>(null);
	const [asSpectator, setAsSpectator] = useState(false);

	const [roomState, setRoomState] = useState('');

	const loc = useLocation();

	useEffect(() =>
	{
		socket?.on('queueing', () =>
		{
			setStatus('queueing');
			masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.WAITING})
		});

		socket?.on('inviteGameCreated', (payload: any) =>
		{
			const {gameId, invitedUser} = payload;
			masterSocket?.emit('invite', {gameId, invitedUser});
			setStatus('queueing');
			masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.WAITING})
			masterSocket?.on('invitationDeclined', () =>
			{
				socket?.emit("leaveQueue");
				setError('Your invitation was declined');
				setRoomState('');
				masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.NONE})
			});
		});
		masterSocket?.on('userOffline', () =>
		{			
			socket?.emit("leaveQueue");
			setError('The person you invited is offline');
			setRoomState('');
		});
		socket?.on("leftQueue", () =>
		{
			// setStatus('waiting');
			masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.NONE})
			masterSocket?.off("invitationDeclined");
		});

		socket?.on('exception', (payload: any) =>
		{
			console.log("exception received");
			console.log({payload});
			setError(payload.message);
		});

		socket?.on('roomReady', (payload: any) =>
		{
			const {room} = payload;
			setStatus('matchFound');
			setRoomState(room);
			// masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.INGAME})
		});

		socket?.on('startGame', () =>
		{
			setError('starting game');
			setAsSpectator(false);
			setStatus('ongoingGame');
			masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.INGAME})
		});

		socket?.on('startGameAsSpectator', () =>
		{
			setError('starting game as spectator');
			setAsSpectator(true);
			setStatus('ongoingGame');
			masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.INGAME})
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
			masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.NONE})
		});

		socket?.on('matchDeclinedByOpponent', () =>
		{
			setStatus('waiting');
			setError('Your opponent declined the match lol what a fucking loser');
			setRoomState('');
			masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.NONE})
		});

		return () =>
		{
			if (status !== 'waiting' && status !== 'gamesList' && status !== 'customGame')
				masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.NONE})
		}
	}, [])

	useEffect(() =>
	{
		if (loc?.state?.action === 'joinInvite')
			socket?.emit('joinCustomGame', {room: loc?.state?.gameId});
		loc.state = {};
	}, [loc]);

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
		masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.NONE})

	}

	return (
		<div className="flex flex-col md:flex-row">
			<GameSideBar socket={socket} status={status} setCustomGame={() => setStatus('customGame')}/>
			{
				
				status === 'matchAccepted' ?
				<>
					<p>Waiting for the other player...</p>
				</>

				: status === 'matchFound' ?
				<>
					<p>Match Found!!!!!!!!!!</p>
					<button onClick={() => socket?.emit('acceptMatch', {room: roomState})}>Accept</button>
					<button onClick={() => socket?.emit('declineMatch')}>Decline</button>
				</>

				: status === 'queueing' ?
				<>
					<p>In Queue...</p>
					<button onClick={() => {setStatus('waiting');socket?.emit("leaveQueue");}}>Stop Queue</button>
				</>

				: status === 'ongoingGame' ?
				<>
					<Pong goBack={leaveGame} asSpectator={asSpectator}/>
				</>

				: status === 'customGame' ?
					<CustomGameScreen goBack={goBack} />

				// : status === 'gamesList' ?
				// 	<GameList goBack={goBack} />

				:
				<></>

			}
			<p>{error}</p>
		</div>
	)
}

export function CustomGameScreen(props: {goBack: any})
{
	const {goBack} = props;
	const {socket} = useContext(GameSocketContext).GameSocketState;
	const me = useContext(SocketContext).SocketState.user;
	const masterSocket = useContext(SocketContext).SocketState.socket;

	const [customGameInfo, setCustomGameInfo] = useState({
		objective: Objective.SCORE,
		goal: 5,
		invitation: false,
		invitedUser: ''
	})
	const [gameVisibility, setGameVisibility] = useState('public');

	const [userSearchFilter, setUserSearchFilter] = useState("");
	const [userToInvite, setUserToInvite] = useState<undefined | {userName: string, id: string}>(undefined);
	const [userList, setUserList] = useState([]);
	let filteredList = userList.filter( (user: any) => {
		return user.userName.includes(userSearchFilter) && user.id !== me.id;
	});

	const [showList, setShowList] = useState(false);

	useEffect(() =>
	{
		async function loadUserList()
		{
			const res = await getAllUsersSelect(new URLSearchParams(
				{
					'id': 'true',
					'userName': 'true',
					'status' : 'true'
				}
			));
			const ret = await res.json();
			setUserList(ret);
		}
		loadUserList();

	}, [])

	function customGameSubmit(e: any)
	{
		console.log('customGameSubmit log');
		e.preventDefault();
		let payload;
		if (userToInvite && gameVisibility === 'invite')
		{
			payload = {...customGameInfo, invitation: true, invitedUser: userToInvite.id};
		}
		else
		{
			payload = {...customGameInfo, invitation:false, invitedUser: ''}
		}
		
		socket?.emit('createCustomGame', {...payload});
	}
	return (
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
				<select value={gameVisibility} onChange={(e) => {setGameVisibility(e.target.value)}}>
					<option value="public">Public</option>
					<option value="invite">Invite-only</option>
				</select>
				{
					gameVisibility === 'invite' ?
					<>
						<div>
							{
								userToInvite?.userName ?
								<p>{`${userToInvite.userName} is set to be invited`}</p>
								: <></>
							}
							<button onClick={(e) => {setShowList(true); e.preventDefault(); e.stopPropagation();}}>Choose a player to invite</button>
							{
								showList?
								<>
									<input className="text-black" type="text" placeholder="Search..." value={userSearchFilter} onChange={(e) => setUserSearchFilter(e.target.value)} />
									<ul>
										{filteredList.map((user: any) =>
											{
												return (
													<li key={user.id} onClick={() => {setUserToInvite({userName: user.userName, id: user.id}); setShowList(false)}}>{user.userName}</li>
												)
											})}
									</ul>
								</>
								:
								<></>
							}
						</div>
					</>
					:
					<></>
				}
				<input type="submit" value="Submit" disabled={gameVisibility === 'invite' && userToInvite?.userName === ''}/>	
			</form>
			<button onClick={goBack}>Go Back!</button>
			</div>
	)
}

export function GameSideBar(props : {socket: any, status: any, setCustomGame: any})
{
	const me = useContext(SocketContext).SocketState.user;
	const {socket} = useContext(GameSocketContext).GameSocketState;
	// const {goBack} = props;
	const [waitingRooms, setWaitingRooms] = useState([]);
	const [ongoingGames, setOngoingGames] = useState([]);

	useEffect(() =>
	{
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
		return (() =>
		{
			socket?.off('games');
			socket?.off('waitingRooms');
			socket?.off('ongoingGames');
		})
	}, [])

	return (
		<div className="bg-gray-700 w-full h-screen rounded drop-shadow-lg
			md:w-52
			text-gray-300 overflow-auto">
			<button className="flex flex-row gap-4 m-2 items-center h-12 w-11/12
						text-xl cursor-pointer rounded
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
						onClick={() => {
							if (props.status !== 'queueing')
								socket?.emit('quickplay');
							}}>
				Quickplay
			</button>
			<hr className="border-gray-600 mb-2 w-11/12 m-auto" />
			<button className="flex flex-row gap-4 m-2 items-center h-12 w-11/12
						text-xl cursor-pointer rounded
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
						onClick={() => {
						 	if (props.status === 'queueing')
						 	{
						 		socket?.emit("leaveQueue");
							}
							props.setCustomGame();
						 }}>
						{/* onClick={props.setCustomGame}> */}
				Custom Game
			</button>
			<hr className="border-gray-600 mb-2 w-11/12 m-auto" />
			<div className="flex flex-row gap-4 m-2 items-center h-12 w-11/12
						text-xl cursor-pointer rounded">
				Games List
			</div>
			<Accordeon title={'Waiting rooms'} bgColor={'bg-gray-700'}>

				{
					waitingRooms.map( (room:any) =>
					{
						console.log(room);
						if (room.invitation === false && room.user1 !== me.userName)
							return (
								<div className="flex flex-col bg-gray-600 mb-2 w-11/12 m-auto
										cursor-pointer rounded
										">
									<p><span className="text-gray-400 text-sm">user: </span><span className="text-gray-300 text-base">{room.user1}</span></p>
									<hr className="border-gray-500" />
									<p><span className="text-gray-400 text-sm">objective: </span><span className="text-gray-300 text-base">{room.goal} {room.objective === Objective.SCORE ? "points" : "minutes"}</span></p>
									<button className="hover:bg-gray-400 hover:text-white hover:shadow-gray-900 hover:shadow-sm border-2 border-gray-500"
										onClick={() => socket?.emit('joinCustomGame', {room: room.id})}>Join Game!!!!!</button>
								</div>
							)
					})
				}
			</Accordeon>
			<Accordeon title={'Ongoing games'}>
			{
				ongoingGames.map((game: any) =>
				{
					return (
						<div className="flex flex-col bg-gray-600 mb-2 w-11/12 m-auto
						cursor-pointer rounded
						">
							<p><span className="text-gray-300 text-base">{game.user1}</span><span className="text-gray-400 text-sm"> vs </span><span className="text-gray-300 text-base">{game.user2}</span></p>
							<hr className="border-gray-500" />
							<p><span className="text-gray-400 text-sm">objective: </span><span className="text-gray-300 text-base">{game.goal} {game.objective === Objective.SCORE ? "points" : "minutes"}</span></p>
							<hr className="border-gray-500" />
							<p>time elapsed: coming soon</p>
							<button className="hover:bg-gray-400 hover:text-white hover:shadow-gray-900 hover:shadow-sm border-2 border-gray-500"
								onClick={() => {socket?.emit('joinAsSpectator', {room: game.id});}}>Join as Spectator</button>
						</div>
					)
				})
			}
			</Accordeon>
			{/* <button onClick={goBack}>Go Back!</button> */}
	</div>
	)
}