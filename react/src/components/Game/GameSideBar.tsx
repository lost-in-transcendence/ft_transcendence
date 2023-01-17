import { useContext, useEffect, useState } from "react";
import { GiPingPongBat as PongIcon } from 'react-icons/gi'
import { FaCogs } from "react-icons/fa";

import { User } from "../../dto/users.dto";
import { Objective } from "../../routes/game";
import { Accordeon } from "../Menu/Accordeon";
import SocketContext from "../Socket/socket-context";
import GameSocketContext from "./Context/game-socket-context";

export function GameSideBar(props: { socket: any, status: any, setCustomGame: any, setQuickPlay: any })
{
	const me: User = useContext(SocketContext).SocketState.user;
	const { socket } = useContext(GameSocketContext).GameSocketState;
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
			md:w-52 md:min-w-[13rem]
			text-gray-300 overflow-auto">
			<button className="flex flex-row gap-4 m-2 justify-start p-2 items-center h-12 w-11/12
						text-xl cursor-pointer rounded
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
				onClick={props.setQuickPlay}
				disabled={me.gameStatus !== 'NONE' && props.status !== 'waiting' ? true : false}
			>
				<PongIcon />
				Quickplay
			</button>
			<button className="flex flex-row gap-4 m-2 p-2 items-center h-12 w-11/12
						text-xl cursor-pointer rounded
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
				onClick={() =>
				{
					props.setCustomGame();
				}}
				disabled={me.gameStatus !== 'NONE' && props.status !== 'waiting' ? true : false}
			>
				<FaCogs />
				Custom Game
			</button>
			<hr className="border-gray-600 mb-2 w-11/12 m-auto" />
			<div className="flex flex-row gap-4 m-2 items-center h-12 w-11/12
						text-xl cursor-pointer rounded">
				Games List
			</div>
			<Accordeon title={'Waiting rooms'} bgColor={'bg-gray-700'}>

				{
					waitingRooms.map((room: any) =>
					{
						if (room.invitation === false && room.user1 !== me.userName)
							return (
								<div
									key={room.id}
									className="flex flex-col justify-start items-center bg-gray-600 rounded shadow m-2 p-2"
								>
									<div className="flex justify-between w-full items-center">
										<span className="text-gray-400 text-sm">
											Player
										</span>
										<span className="text-gray-300 text-base ml-3 truncate">
											{room.user1}
										</span>
									</div>
									<hr className="border-gray-500" />
									<div className="flex justify-between w-full items-center">
										<span className="text-gray-400 text-sm">
											Objective
										</span>
										<span className="text-gray-300 text-base">
											{room.goal} {room.objective === Objective.SCORE ? "points" : "minutes"}
										</span>
									</div>
									<hr className="border-gray-500" />
									<div className="flex justify-between w-full items-center">
										<span className="text-gray-400 text-sm">
											Theme
										</span>
										<span className="text-gray-300 text-base">
											{room.theme}
										</span>
									</div>
									<button
										className="bg-indigo-500 hover:bg-indigo-600 rounded shadow px-1 m-1 mb-0"
										onClick={() => socket?.emit('joinCustomGame', { room: room.id })}
										disabled={me.gameStatus !== 'NONE' && props.status !== 'waiting' ? true : false}
									>
										Join
									</button>
								</div>
							)
					})
				}
			</Accordeon>
			<Accordeon title={'Ongoing games'} bgColor={'bg-gray-700'}>
				{
					ongoingGames.map((game: any) =>
					{
						return (
							<div
								key={game.id}
								className="flex flex-col justify-start items-center bg-gray-600 rounded shadow m-2 p-2"
							>
								<div
									className="flex flex-row items-center w-full justify-between mb-3 bg-gray-700 rounded shadow px-1"
								>
									<span className="text-gray-300 text-base basis-full truncate">
										{game.user1}
									</span>
									<span className="text-gray-400 text-sm basis-0">
										vs
									</span>
									<span className="text-gray-300 text-base basis-full text-right truncate">
										{game.user2}
									</span>
								</div>
								<hr className="border-gray-500" />
								<div
									className="flex justify-between items-center w-full"
								>
									<span

									className="text-gray-400 text-sm basis-full mr-1"
									>
										objective:
									</span>
									<span
									className="text-gray-300 text-left basis-0 "
									>
									{game.goal}
									{game.objective === Objective.SCORE ? "points" : "min"}
									</span>
								</div>
								<hr className="border-gray-500" />
								<div
									className="flex w-full flex-row items-center justify-between"
								>
									<span
										className="text-gray-400 text-sm mr-1"
									>
										theme:
									</span>
									<span
										className="text-gray-300 text-base ml-1"
									>
										{game.theme}
									</span>
								</div>
								<button
									className="bg-indigo-500 hover:bg-indigo-600 rounded shadow px-1 m-1 mb-0"
									onClick={() => { socket?.emit('joinAsSpectator', { room: game.id }); }}
									disabled={me.gameStatus !== 'NONE' && props.status !== 'waiting' ? true : false}
								>
									Spectate
								</button>
							</div>
						)
					})
				}
			</Accordeon>
		</div>
	)
}
