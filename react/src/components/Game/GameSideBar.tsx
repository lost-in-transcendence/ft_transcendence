import { useContext, useEffect, useState } from "react";
import { User } from "../../dto/users.dto";
import { Objective } from "../../routes/game";
import { Accordeon } from "../Menu/Accordeon";
import SocketContext from "../Socket/socket-context";
import GameSocketContext from "./Context/game-socket-context";

export function GameSideBar(props : {socket: any, status: any, setCustomGame: any, setQuickPlay: any})
{
	const me: User = useContext(SocketContext).SocketState.user;
	const {socket} = useContext(GameSocketContext).GameSocketState;
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
			<button className="flex flex-row gap-4 m-2 items-center h-12 w-11/12
						text-xl cursor-pointer rounded
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
						onClick={props.setQuickPlay}
						disabled={me.gameStatus !== 'NONE' && props.status !== 'waiting' ? true : false}
						>
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
						 }}
						disabled={me.gameStatus !== 'NONE' && props.status !== 'waiting' ? true : false}
			>
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
						if (room.invitation === false && room.user1 !== me.userName)
							return (
								<div className="flex flex-col bg-gray-600 mb-2 w-11/12 m-auto
										cursor-pointer rounded
										">
									<p><span className="text-gray-400 text-sm">user: </span><span className="text-gray-300 text-base">{room.user1}</span></p>
									<hr className="border-gray-500" />
									<p><span className="text-gray-400 text-sm">objective: </span><span className="text-gray-300 text-base">{room.goal} {room.objective === Objective.SCORE ? "points" : "minutes"}</span></p>
									<hr className="border-gray-500" />
									<p><span className="text-gray-400 text-sm">theme: </span><span className="text-gray-300 text-base">{room.theme}</span></p>
									<button className="hover:bg-gray-400 hover:text-white hover:shadow-gray-900 hover:shadow-sm border-2 border-gray-500"
										onClick={() => socket?.emit('joinCustomGame', {room: room.id})}
										disabled={me.gameStatus !== 'NONE' && props.status !== 'waiting' ? true : false}
									>Join Game!!!!!</button>
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
							<p><span className="text-gray-400 text-sm">theme: </span><span className="text-gray-300 text-base">{game.theme}</span></p>
							<button className="hover:bg-gray-400 hover:text-white hover:shadow-gray-900 hover:shadow-sm border-2 border-gray-500"
								onClick={() => {socket?.emit('joinAsSpectator', {room: game.id});}}
								disabled={me.gameStatus !== 'NONE' && props.status !== 'waiting' ? true : false}
							>Join as Spectator</button>
						</div>
					)
				})
			}
			</Accordeon>
			{/* <button onClick={goBack}>Go Back!</button> */}
	</div>
	)
}
