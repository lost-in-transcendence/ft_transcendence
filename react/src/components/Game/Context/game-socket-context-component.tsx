import { useEffect, useInsertionEffect, useReducer, useState } from "react";

import { useSocket } from "../../hooks/use-socket";
import { getCookie } from "../../requests";
import { defaultSocketContextState, SocketReducer } from "../../Socket/socket-context";
import { GameSocketContextProvider } from "./game-socket-context";

export default function GameSocketContextComponent(props: any)
{
	const {children} = props;

	const [GameSocketState, GameSocketDispatch] = useReducer(SocketReducer, defaultSocketContextState);
	const [loading, setLoading] = useState(true);


	const socket = useSocket("http://localhost:3333/game",
	{
		reconnectionAttempts: 5,
		reconnectionDelay: 5000,
		autoConnect: false,
		extraHeaders: { "Authorization": "Bearer " + getCookie('jwt') },
	})

	useEffect(() =>
	{
		socket.connect();

		GameSocketDispatch({type: 'update_socket', payload: socket});

		StartListeners();

		SendHandshake();
		return () =>
		{
			console.log("in game socket context dismount");
		}
	}, [])

	function StartListeners()
	{
		/* Reconnect events */
		socket.io.on('reconnect', (attempt : number) =>
		{
			console.info(`Reconnected on attempt ${attempt}`);
		});

		socket.io.on('reconnect_attempt', (attempt : number) =>
		{
			console.info(`Reconnection attempt ${attempt}`);
		});

		socket.io.on('reconnect_error', (err : any) =>
		{
			console.info(`Reconnection error: ${err}`);
		});

		socket.io.on('reconnect_failed', () =>
		{
			console.info(`Reconnection failure`);
			alert('Unable to reconnect to websocket server');
		})

		socket.on('handshake', (payload: any) =>
		{
			console.info('Handshake received from server');
			setLoading(false);
			console.info(socket.id);
		});
	}

	function SendHandshake()
	{
	}

	if (loading)
		return <p>Loading Socket IO...</p>

	return (
		<GameSocketContextProvider value={{ GameSocketState, GameSocketDispatch}}>
			{children}
		</GameSocketContextProvider>
	)
};

