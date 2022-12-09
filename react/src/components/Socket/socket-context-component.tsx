import { useEffect, useInsertionEffect, useReducer, useState } from "react";

import { useSocket } from "../../hooks/use-socket";
import { getCookie } from "../../requests";
import { defaultSocketContextState, SocketContextProvider, SocketReducer } from "./socket-context";
import * as events from '../../../shared/constants/users'
import { changeStatus } from "../../requests/ws/users.messages";
import { SharedUserStatus } from "../../../shared/dtos";

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
		return () =>
		{
			console.log("in socket context dismount");
			changeStatus(socket, SharedUserStatus.OFFLINE);
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
			SocketDispatch({type: 'update_user', payload});
			socket.emit(events.CHANGE_STATUS, {status: 'ONLINE'});
			setLoading(false);
			console.info(socket.id);
		});

		socket.on(events.UPDATE_USER, (payload: any) =>
		{
			SocketDispatch({type: 'update_user', payload});
		})
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
