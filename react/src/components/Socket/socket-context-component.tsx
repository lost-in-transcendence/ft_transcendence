import { useEffect, useInsertionEffect, useReducer, useState } from "react";

import { useSocket } from "../../hooks/use-socket";
import { getCookie } from "../../requests";
import { defaultSocketContextState, SocketContextProvider, SocketReducer } from "./socket-context";

export default function SocketContextComponent(props: any)
{
	const {children} = props;

	const [SocketState, SocketDispatch] = useReducer(SocketReducer, defaultSocketContextState);
	const [loading, setLoading] = useState(true);


	const socket = useSocket("http://localhost:3333",
	{
		reconnectionAttempts: 5,
		reconnectionDelay: 5000,
		autoConnect: false,
		extraHeaders: { "Authorization": "Bearer " + getCookie('jwt') },
	})

	useEffect(() =>
	{
		socket.connect();

		SocketDispatch({type: 'update_socket', payload: socket});

		StartListeners();

		SendHandshake();
	}, [])

	function StartListeners()
	{
		/* Reconnect events */
		socket.io.on('reconnect', (attempt) =>
		{
			console.info(`Reconnected on attempt ${attempt}`);
		});

		socket.io.on('reconnect_attempt', (attempt) =>
		{
			console.info(`Reconnection attempt ${attempt}`);
		});

		socket.io.on('reconnect_error', (err) =>
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
			SocketDispatch({type: 'update_user', payload});
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
		<SocketContextProvider value={{ SocketState, SocketDispatch}}>
			{children}
		</SocketContextProvider>
	)
};
