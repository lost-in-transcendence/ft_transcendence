import { useContext } from "react";
import { GiPingPongBat } from 'react-icons/gi'

import { Accordeon } from "../Menu/Accordeon"
import SocketContext from "../Socket/socket-context";
import GameSocketContext from "./Context/game-socket-context";

export function QuickPlayMenu()
{
	const { socket } = useContext(GameSocketContext).GameSocketState;
	const gameStatus = useContext(SocketContext).SocketState.user.gameStatus;

	return (
		<div className="flex flex-col gap-4 w-full ">
			<Accordeon
				title={
					<div className="flex items-center justify-between gap-2 p-1">
						<GiPingPongBat className="text-emerald-600" />
						Rules And Instructions
						<GiPingPongBat className="text-emerald-600" style={{transform: 'scaleX(-1)'}}/>
					</div>
				}
				bgColor={'bg-gray-600'}
				width=''
				parentClassName='bg-gray-700 mx-auto text-gray-300 text-xl mt-1'
				childrenClassName='mx-4 my-2 p-2 rounded-lg shadow'
			>
				<p className="text-gray-300" >
					<h2 className="text-2xl">Rules are simple :</h2>
					<ul>
						<li>
							- If the ball passes your oponent's paddle you score a Point
						</li>
						<li>
							- Score as many points as you can before the time limit or reach the point limit and victory is yours !
						</li>
					</ul>
					<br />
					<h2 className="text-2xl">Controls :</h2>
					<ul>
						<li>
							<span>W</span> : Move paddle UP
						</li>
						<li>
							<span>S</span> : Move paddle DOWN
						</li>
					</ul>
				</p>
			</Accordeon>
			<button className="
						 flex flex-row gap-4 items-center mx-auto p-1 justify-items-center
						text-xl text-gray-300 cursor-pointer rounded bg-indigo-600
						hover:bg-indigo-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-indigo-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
				onClick={() => { socket?.emit('quickplay') }}
				disabled={gameStatus !== 'NONE' ? true : false}
			>
				Join Queue
			</button>
		</div>
	)
}
