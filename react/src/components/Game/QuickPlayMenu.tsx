import { useContext } from "react";

import { Accordeon } from "../Menu/Accordeon"
import SocketContext from "../Socket/socket-context";
import GameSocketContext from "./Context/game-socket-context";

export function QuickPlayMenu()
{
	const { socket } = useContext(GameSocketContext).GameSocketState;
	const gameStatus = useContext(SocketContext).SocketState.user.gameStatus;

	return (
		<div className="flex flex-col gap-4 w-full ">
			<Accordeon title={'Rules And Instructions'} bgColor={'bg-gray-600'} width='bg-gray-600 w-auto mx-auto text-xl text-gray-400'>
				<p className=" flex flex-row" >Rule Set</p>
			</Accordeon>
			<button className="
						 flex flex-row gap-4 items-center mt-10 mx-auto h-12 w-auto justify-items-center
						text-xl text-gray-400 cursor-pointer rounded bg-gray-600
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
				onClick={() => { socket?.emit('quickplay') }}
				disabled={gameStatus !== 'NONE' ? true : false}
			>
				Quickplay
			</button>
		</div>
	)
}
