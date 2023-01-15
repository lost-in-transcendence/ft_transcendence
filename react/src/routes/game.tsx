import { useContext, useEffect, useState } from "react";
import { Params, useLoaderData, useLocation, useParams, useSearchParams } from "react-router-dom";
import { getAllUsersSelect, getOngoingGame } from "../requests";
import GameSocketContext from "../components/Game/Context/game-socket-context";
import { Pong } from "../components/Pong/Pong";
import SocketContext from "../components/Socket/socket-context";
import { GameStatus } from "../dto/game.dto";
import { Accordeon } from "../components/Menu/Accordeon"
import { GameSideBar } from "../components/Game/Context/GameSideBar";
import { SharedGameStatusDto } from "../../shared/dtos";
import { Spinner } from "../components/Spinner/Spinner";
import { PartialUser } from "../dto/users.dto";

export async function loader()
{
	const res = await getAllUsersSelect(new URLSearchParams(
		{
			'id': 'true',
			'userName': 'true',
			'status': 'true'
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
	const { socket } = useContext(GameSocketContext).GameSocketState;
	const masterSocket = useContext(SocketContext).SocketState.socket;
	const gameStatus = useContext(SocketContext).SocketState.user.gameStatus;
	const [status, setStatus] = useState('waiting')
	const [error, setError] = useState<string | null>(null);
	const [asSpectator, setAsSpectator] = useState(false);

	const [roomState, setRoomState] = useState('');
	const [gameInfos, setGameInfos] = useState<{theme: string, user1Name: string, user2Name: string, launchTime: number} | undefined>(undefined);

	const [params, setParams] = useSearchParams();

	useEffect(() =>
	{
		socket?.on('queueing', () =>
		{
			setStatus('queueing');
			masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.WAITING })
		});

		socket?.on('inviteGameCreated', (payload: any) =>
		{
			const { gameId, invitedUser } = payload;
			masterSocket?.emit('invite', { gameId, invitedUser });
			setStatus('queueing');
			masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.WAITING })
			masterSocket?.on('invitationDeclined', () =>
			{
				socket?.emit("leaveQueue");
				setError('Your invitation was declined');
				setRoomState('');
				masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.NONE })
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
			masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.NONE })
			masterSocket?.off("invitationDeclined");
		});

		socket?.on('exception', (payload: any) =>
		{
			setError(payload.message);
		});

		socket?.on('roomReady', (payload: any) =>
		{
			const {roomId, user1Name, user2Name, theme, launchTime} = payload;
			console.log('roomReady received  payload:', payload);
			setStatus('matchFound');
			// console.log('roomReady received  room:', roomId);
			setRoomState(roomId);
			setGameInfos({theme, user1Name, user2Name, launchTime});
			masterSocket?.off('invitationDeclined');
			// masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.INGAME})
		});

		socket?.on('startGame', () =>
		{
			setError(null);
			setAsSpectator(false);
			setStatus('ongoingGame');
			masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.INGAME })
		});

		socket?.on('startGameAsSpectator', (payload: any) =>
		{
			// setError('starting game as spectator');
			const {user1Name, user2Name, theme, launchTime} = payload;
			console.log(payload);
			setAsSpectator(true);
			setStatus('ongoingGame');
			setGameInfos({theme, user1Name, user2Name, launchTime});
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
			masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.NONE })
		});

		socket?.on('matchDeclinedByOpponent', () =>
		{
			setStatus('waiting');
			setError('Your opponent declined the match');
			setRoomState('');
			masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.NONE })
		});

		return () =>
		{
			if (gameStatus !== SharedGameStatusDto.NONE)
				masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.NONE })
		}
	}, [])

	useEffect(() =>
	{
		async function load()
		{
			const action = params.get('action');
			const userName = params.get('userName');
			const gameId = params.get('gameId');
			if (!action)
				return;
			if (action === 'invitePlayer')
			{
				if (!userName)
				{
					setError("Cannot invite, no username provided")
					return;
				}
				setStatus('customGame');
				return;
			}
			else if (action === 'joinInvite')
			{
				if (!gameId)
				{
					setError("Cannot find game, no game Id provided");
					return;
				}
				socket?.emit('joinCustomGame', { room: gameId });
			}
			else if (action === 'spectateGame')
			{
				if (!userName)
				{
					setError("Cannot find game, no username provided");
					return;
				}
				const res = await getOngoingGame(userName);
				const ongoingGame = await res.json();
				if (Object.keys(ongoingGame).length === 0)
				{
					setError("Cannot find game, game does not exist or has ended");
					return;
				}
				socket?.emit('joinAsSpectator', { room: ongoingGame.id });
			}
		}
		load();
	}, [params]);

	function goBack()
	{
		setStatus('waiting');
		masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.NONE })
		setError(null);
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
		masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.NONE })

	}

	return (
		<div className="flex flex-col md:flex-row w-full">
		{
			status === 'ongoingGame' ?
			<div className="">
				<Pong goBack={leaveGame} asSpectator={asSpectator} gameInfos={gameInfos}/>
			</div>
			: <GameSideBar socket={socket} status={status} setQuickPlay={(e : any) => {setStatus('quickplayMenu'); setError(null);}} setCustomGame={(e: any) => {setStatus('customGame'); setError(null);}}/>
		}
		{
			error ?
			<div className="flex flex-col gap-4 w-full">
				<div className="flex flex-col items-center m-auto
				text-xl text-gray-400 bg-gray-700">
							<p>{error}</p>
						</div>
					</div>
					: status === 'quickplayMenu' ?
						<div className="flex flex-col gap-4 w-full">
							<Accordeon title={'Rules And Instructions'} bgColor={'bg-gray-600'} width='bg-gray-600 w-auto mx-auto text-xl text-gray-400'>
								<p className="flex flex-row" >blabladfsdfsdfsdfsdfsdddddddddddddddddddddddddsfsdfsdfsd sdfsdfsdf sdf sdf sdfsd  fsd fsdfsdfsdf sdf sd fsd fsd fsdf sdsdf sdfhsdh srth srtt hsrth aer yhrthad gojahdkg hakjdg jg hakjhgjha guhk ghakdg kajd g kg</p>
							</Accordeon>
							<button className="flex flex-row gap-4 items-center mt-10 mx-auto h-12 w-auto justify-items-center
						text-xl text-gray-400 cursor-pointer rounded bg-gray-600
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
								onClick={() => { socket?.emit('quickplay') }}
								disabled={gameStatus !== 'NONE' ? true : false}
							>
								Quickplay
							</button>
						</div>

						: status === 'matchAccepted' ?
							<div className="flex flex-col gap-4 w-full">
								<div className="flex flex-col items-center m-auto
				text-xl text-gray-400 bg-gray-700">
									<p>Waiting for the other player</p>
									<Spinner />
								</div>
							</div>

							: status === 'matchFound' ?
								<div className="flex flex-col gap-4 w-full">
									<div className="flex flex-col items-center m-auto
				text-xl text-gray-400 bg-gray-700">
										<p>Match Found!!!!!!!!!!</p>
										<div className="flex flex-row items-center m-auto gap-1
					text-xl text-gray-100 bg-black">
											<button className="border-2 border-green-600"
												onClick={() => socket?.emit('acceptMatch', { room: roomState })}>
												Accept
											</button>
											<button className="border-2 border-red-600"
												onClick={() => socket?.emit('declineMatch')}>
												Decline
											</button>
										</div>
									</div>

								</div>

								: status === 'queueing' ?
									<div className="flex flex-col gap-4 w-full">
										<div className="flex flex-col items-center m-auto gap-2
				text-xl text-gray-400 bg-gray-700">
											<p>In Queue</p>
											<Spinner />
											<div className="flex flex-row items-center mx-auto mt-2 gap-1
					text-xl text-gray-100 bg-black">
												<button onClick={() => { setStatus('waiting'); socket?.emit("leaveQueue"); }}>Stop Queue</button>
											</div>
										</div>
									</div>

									: status === 'customGame' ?
										<CustomGameScreen goBack={goBack} params={params} />

										:
										<></>

			}
		</div>
	)
}

export function CustomGameScreen({ goBack, params }: { goBack: Function, params: URLSearchParams })
{
	// const {goBack, params} = props;
	const { socket } = useContext(GameSocketContext).GameSocketState;
	const me = useContext(SocketContext).SocketState.user;
	const masterSocket = useContext(SocketContext).SocketState.socket;

	const [customGameInfo, setCustomGameInfo] = useState({
		objective: Objective.SCORE,
		goal: 5,
		theme: 'classic',
		invitation: false,
		invitedUser: ''
	})
	const [gameVisibility, setGameVisibility] = useState('public');

	const [userSearchFilter, setUserSearchFilter] = useState("");
	const [userToInvite, setUserToInvite] = useState<undefined | { userName: string, id: string }>(undefined);
	const [userList, setUserList] = useState<PartialUser[]>([]);
	let filteredList = userList.filter((user: any) =>
	{
		return user.userName.includes(userSearchFilter) && user.id !== me.id;
	});

	const [showList, setShowList] = useState(false);

	useEffect(() =>
	{
		async function load()
		{
			const loadedUserList = await loadUserList();
			const action = params.get('action');
			const userName = params.get('userName');
			if (!action)
				return;
			if (action === 'invitePlayer')
			{
				if (!userName)
				{
					return;
				}
				const ret = loadedUserList.find((v: PartialUser) => { return v.userName === userName })
				if (!ret || !ret.id)
					return;
				setGameVisibility('invite')
				setUserToInvite({ userName, id: ret.id })
			}
		}
		async function loadUserList()
		{
			const res = await getAllUsersSelect(new URLSearchParams(
				{
					'id': 'true',
					'userName': 'true',
					'status': 'true'
				}
			));
			const ret = await res.json();
			setUserList(ret);
			return ret;
		}
		load();
	}, [])

	function customGameSubmit(e: any)
	{
		e.preventDefault();
		let payload;
		if (userToInvite && gameVisibility === 'invite')
		{
			payload = { ...customGameInfo, invitation: true, invitedUser: userToInvite.id };
		}
		else
		{
			payload = { ...customGameInfo, invitation: false, invitedUser: '' }
		}

		socket?.emit('createCustomGame', { ...payload });
	}
	return (
		<div className="flex flex-row gap-4 mx-auto w-full">
			<form className="flex flex-col"
			onSubmit={customGameSubmit}>
				<div className="flex flex-row gap-4 items-center mx-auto w-full">
					<p className="flex flex-col text-gray-100 text-xl bg-gray-800">Theme</p>
					<select className="flex flex-col text-gray-100 bg-gray-700 text-xl"
					value={customGameInfo.theme}
					onChange={(e) => 
					{
						setCustomGameInfo({...customGameInfo, theme: e.target.value})
					}}
					>
						<option value='classic'>Classic</option>
						<option value='camouflage'>Camouflage</option>
						<option value='rolandGarros'>Roland Garros</option>
					</select>
				</div>
				<div className="flex flex-row gap-4 items-center mx-auto w-full">
					<p className="flex flex-col text-gray-100 text-xl bg-gray-800">Objective Type</p>
					<select className="flex flex-col text-gray-100 bg-gray-700 text-xl"
						value={customGameInfo.objective === Objective.SCORE ? 'score' : 'time'} onChange={(e) =>
						{
							let val = Objective.SCORE;
							if (e.target.value === 'score')
								val = Objective.SCORE;
							else if (e.target.value === 'time')
								val = Objective.TIME;
							setCustomGameInfo({ ...customGameInfo, objective: val })
						}}>
						<option value='score'>Score</option>
						<option value='time'>Time</option>
					</select>
				</div>

				<div className="flex flex-row gap-4 items-center mx-auto w-full">
					<p className="flex flex-col text-gray-100 text-xl bg-gray-800">Objective ({customGameInfo.objective === Objective.SCORE ? 'points' : 'minutes'})</p>
					<select className="flex flex-col text-gray-100 bg-gray-700 text-xl"
						value={customGameInfo.goal} onChange={(e) =>
						{
							setCustomGameInfo({ ...customGameInfo, goal: Number(e.target.value) })
						}}>
						<option value='3'>3</option>
						<option value='5'>5</option>
						<option value='10'>10</option>
					</select>
				</div>

				<div className="flex flex-row gap-4 items-center mx-auto w-full">
					<p className="flex flex-col text-gray-100 text-xl bg-gray-800">Game Visibility</p>
					<select className="flex flex-col text-gray-100 bg-gray-700 text-xl"
						value={gameVisibility} onChange={(e) => { setGameVisibility(e.target.value); setUserToInvite(undefined); setShowList(false); }}>
						<option value="public">Public</option>
						<option value="invite">Invite-only</option>
					</select>
				</div>

				{
					gameVisibility === 'invite' ?
						<div className="flex flex-row gap-4 items-center mx-auto w-full">
							{
								userToInvite?.userName ?
									<p className="flex flex-col text-gray-100 text-xl bg-gray-800">{`${userToInvite.userName} is set to be invited`}</p>
									:
									<></>
							}
							<button className="flex flex-row gap-4 items-center mt-2 h-12 w-auto
						text-xl text-gray-400 cursor-pointer rounded bg-gray-600
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
								onClick={(e) => { setShowList(true); e.preventDefault(); e.stopPropagation(); }}
							>
								Choose a player to invite
							</button>
						</div>
						: <></>
				}

				{
					gameVisibility === 'invite' ?
						showList ?
							<div className="flex flex-row gap-10 items-center mx-auto w-full">
								<input className="flex flex-row text-gray-100 text-xl my-12 bg-gray-800 border-2 border-white" type="text" placeholder="Search..." value={userSearchFilter} onChange={(e) => setUserSearchFilter(e.target.value)} />
								<ul className="flex flex-row max-height-40 gap-2">
									{
										filteredList.map((user: any) =>
										{
											return (
												<li className="flex flex-row gap-4 items-center mx-auto h-12 w-auto justify-items-center
											text-xl text-gray-400 cursor-pointer rounded bg-gray-600
											hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
											focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
													key={user.id} onClick={() => { setUserToInvite({ userName: user.userName, id: user.id }); setShowList(false) }}>{user.userName}</li>
											)
										})
									}
								</ul>
							</div>
							: <></>
						: <></>
				}
				<input className="flex flex-row gap-4 items-center mt-2 mx-auto h-12 w-auto
				text-xl text-gray-400 cursor-pointer rounded bg-gray-600 border-2 border-green-600
				hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
				focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
					type="submit" value="Submit" disabled={gameVisibility !== 'invite' ?
						false :
						userToInvite === undefined ?
							true :
							userToInvite.userName === '' ?
								true :
								false}
				/>
				<button className="flex flex-row gap-4 items-center mt-2 mx-auto h-12 w-auto
						text-xl text-gray-400 cursor-pointer rounded bg-gray-600 border-2 border-red-600
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
					onClick={() => goBack()}>Go Back!</button>
			</form>
		</div>
	)
}
