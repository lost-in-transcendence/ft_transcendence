import { useContext, useEffect, useState } from "react";
import { Params, useLoaderData, useLocation, useParams, useSearchParams } from "react-router-dom";
import { getAllUsersSelect, getOngoingGame } from "../requests";
import GameSocketContext from "../components/Game/Context/game-socket-context";
import { Pong } from "../components/Pong/Pong";
import SocketContext from "../components/Socket/socket-context";
import { GameStatus } from "../dto/game.dto";
import { Accordeon } from "../components/Menu/Accordeon"
import { GameSideBar } from "../components/Game/GameSideBar";
import { SharedGameStatusDto } from "../../shared/dtos";
import { Spinner } from "../components/Spinner/Spinner";
import { PartialUser } from "../dto/users.dto";
import { CustomGameScreen } from "../components/Game/CustomGameScreen";

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
			const { room } = payload;
			setError(null);
			setStatus('matchFound');
			setRoomState(room);
			masterSocket?.off('invitationDeclined');
			// masterSocket?.emit('changeGameStatus', {gameStatus: GameStatus.INGAME})
		});

		socket?.on('startGame', () =>
		{
			// setError('starting game');
			setError(null);
			setAsSpectator(false);
			setStatus('ongoingGame');
			masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.INGAME })
		});

		socket?.on('startGameAsSpectator', () =>
		{
			// setError('starting game as spectator');
			setAsSpectator(true);
			setStatus('ongoingGame');
			masterSocket?.emit('changeGameStatus', { gameStatus: GameStatus.INGAME })
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
			socket?.off('queueing');
			socket?.off('inviteGameCreated');
			masterSocket?.off('userOffline');
			socket?.off("leftQueue");
			socket?.off('exception');
			socket?.off('roomReady');
			socket?.off('startGame');
			socket?.off('startGameAsSpectator');
			socket?.off('matchAccepted');
			socket?.off('matchDeclined');
			socket?.off('matchDeclinedByOpponent')
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
		<div className="flex flex-col md:flex-row">
			{
				status === 'ongoingGame' ?
					<>
						<Pong goBack={leaveGame} asSpectator={asSpectator} />
					</>
					: <GameSideBar socket={socket} status={status} setQuickPlay={() => { setStatus('quickplayMenu'); setError(null); }} setCustomGame={() => { setStatus('customGame'); setError(null); }} />
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