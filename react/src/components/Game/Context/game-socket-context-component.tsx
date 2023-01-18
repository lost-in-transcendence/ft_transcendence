import { useEffect, useInsertionEffect, useReducer, useState } from "react";
import { useSocket } from "../../../hooks/use-socket";
import { backURL, getCookie } from "../../../requests";

import { defaultSocketContextState, SocketReducer } from "../../Socket/socket-context";
import { Spinner } from "../../Spinner/Spinner";
import { GameSocketContextProvider } from "./game-socket-context";

export default function GameSocketContextComponent(props: any)
{
	const { children } = props;

	const [GameSocketState, GameSocketDispatch] = useReducer(SocketReducer, defaultSocketContextState);
	const [loading, setLoading] = useState(true);


	const socket = useSocket(`${backURL}/game`,
		{
			forceNew: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 5000,
			autoConnect: false,
			extraHeaders: { "Authorization": "Bearer " + getCookie('jwt') },
		})

	useEffect(() =>
	{
		socket.connect();

		GameSocketDispatch({ type: 'update_socket', payload: socket });

		StartListeners();

		SendHandshake();
		return () =>
		{
			socket.offAnyOutgoing();
		}
	}, [])

	function StartListeners()
	{
		/* Reconnect events */
		socket.io.on('reconnect', (attempt: number) =>
		{
			console.info(`Reconnected on attempt ${attempt}`);
		});

		socket.io.on('reconnect_attempt', (attempt: number) =>
		{
			console.info(`Reconnection attempt ${attempt}`);
		});

		socket.io.on('reconnect_error', (err: any) =>
		{
			console.info(`Reconnection error: ${err}`);
		});

		socket.io.on('reconnect_failed', () =>
		{
			console.info(`Reconnection failure`);
			// alert('Unable to reconnect to websocket server');
		})

		socket.on('handshake', (payload: any) =>
		{
			setLoading(false);
		});
	}

	function SendHandshake()
	{
	}

	if (loading)
		return (
			<div className="flex flex-col justify-center items-center h-full w-full">
				<h1 className="text-indigo-300 mb-2 text-3xl">Loading SocketIO ...</h1>
				<Spinner />
			</div>
		)

	return (
		<GameSocketContextProvider value={{ GameSocketState, GameSocketDispatch }}>
			{children}
		</GameSocketContextProvider>
	)
};

