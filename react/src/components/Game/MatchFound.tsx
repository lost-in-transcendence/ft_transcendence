import { useContext } from "react";

import GameSocketContext from "./Context/game-socket-context";

interface IMatchFoundProps
{
	roomState: string
}

export function MatchFound({ roomState }: IMatchFoundProps)
{
	const { socket } = useContext(GameSocketContext).GameSocketState;

	return (
		<div className="flex flex-col items-center justify-start gap-10 w-full text-gray-300">
			<h1 className="text-3xl font-semibold mt-4">Match Found !</h1>

			<img src="https://i.gifer.com/GAvs.gif" className="rounded-full h-52 w-52 border-[6px] border-neutral-100" />
			<div className="flex items-center justify-center gap-5">
				<button className="bg-indigo-600 rounded shadow p-1 font-semibold w-20"
					onClick={() => socket?.emit('acceptMatch', { room: roomState })}>
					Accept
				</button>
				<button className="bg-red-700 rounded shadow p-1 font-semibold w-20"
					onClick={() => socket?.emit('declineMatch')}>
					Decline
				</button>
			</div>
		</div>
	)
}
