import { useContext, useEffect, useState } from "react";
import { useLoaderData, useLocation } from "react-router-dom";
import { getAllUsersSelect } from "../requests";
import GameSocketContext from "../components/Game/Context/game-socket-context";
import { Pong } from "../components/Pong/Pong";
import SocketContext from "../components/Socket/socket-context";
import { GameStatus } from "../dto/game.dto";
import { Accordeon } from "../components/Menu/Accordeon"
import { GameSideBar } from "../components/Game/Context/GameSideBar";

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
	const gameStatus = useContext(SocketContext).SocketState.user.gameStatus;
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
			if (gameStatus !== GameStatus.NONE)
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
		masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.NONE})
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
		{
			status === 'ongoingGame' ?
			<>
				<Pong goBack={leaveGame} asSpectator={asSpectator}/>
			</>
			: <GameSideBar socket={socket} status={status} setQuickPlay={() => setStatus('quickplayMenu')} setCustomGame={() => setStatus('customGame')}/>
		}
		{
			status === 'quickplayMenu' ?
			<>
				<button 
						onClick={() => {socket?.emit('quickplay')}}
						disabled={gameStatus !== 'NONE' ? true : false}
				>
					Quickplay
				</button>
			</>

			: status === 'matchAccepted' ?
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

			: status === 'customGame' ?
			<CustomGameScreen goBack={goBack} />

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