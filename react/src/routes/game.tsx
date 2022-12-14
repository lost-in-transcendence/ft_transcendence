import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { getUserMe } from "../requests";
import GameSocketContext from "../components/Game/Context/game-socket-context";

export async function loader()
{
	// const res = await getUserMe()
	// return res;
}

export function Game()
{
	const {socket} = useContext(GameSocketContext).GameSocketState;
	console.log(socket?.id);
	const [queueing, setQueueing] = useState(false)

	useEffect(() =>
	{
		socket?.on('queueing', () =>
		{
			setQueueing(true);
		})
		socket?.on("leftQueue", () =>
		{
			setQueueing(false);
		})
		socket?.on('exception', (payload: any) =>
		{
			console.log({payload});
		})
	})

	// const user: any = useLoaderData();
	return (
		<div>
			<h1>Game</h1>
			{
				queueing ?
				<>
					<p>In Queue...</p>
					<button onClick={() => socket?.emit("leaveQueue")}>Stop Queue</button>
				</>
				:
				<>
					<button onClick={() => socket?.emit('quickplay')}>Quickplay</button>
				</>
			}
		</div>
	)
}
