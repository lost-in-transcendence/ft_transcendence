import React, { useContext } from "react";

import { Spinner } from "../Spinner/Spinner";
import GameSocketContext from "./Context/game-socket-context";

interface IQueuingProps
{
	setStatus: React.Dispatch<React.SetStateAction<string>>
}

export function Queuing({ setStatus }: IQueuingProps)
{
	const { socket } = useContext(GameSocketContext).GameSocketState;

	return (
		<div className="flex flex-col items-center justify-start gap-10 w-full text-gray-300">
			<h1 className="text-3xl font-semibold mt-4">Waiting for other players</h1>
			<img src='https://i.giphy.com/media/TQhaok8yNsxTnGcOdL/200w.webp' className="rounded-full h-52 w-52" />
			<div className="mx-auto mt-2 text-xl text-gray-100 bg-black">
				<button
					onClick={() => { setStatus('waiting'); socket?.emit("leaveQueue"); }}
					className={`bg-indigo-500 rounded shadow p-1`}
				>
					Leave Queue
				</button>
			</div>
		</div>
	)
}
