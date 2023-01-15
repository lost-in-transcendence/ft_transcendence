import { useContext } from "react";

import GameSocketContext from "./Context/game-socket-context";

interface IMatchFoundProps
{
	roomState: string
}

export function MatchFound({roomState}: IMatchFoundProps)
{
	const { socket } = useContext(GameSocketContext).GameSocketState;

	return (
		<div className="flex flex-col gap-4 w-full">
			<div className="flex flex-col items-center m-auto text-xl text-gray-400 bg-gray-700">
				<p>Match Found !</p>
				<div className="flex flex-row items-center m-auto gap-1 text-xl text-gray-100 bg-black">
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
	)
}
