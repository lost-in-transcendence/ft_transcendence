import { useEffect, useReducer, useState } from "react";

import { useSocket } from "../../../hooks/use-socket";
import { backURL, getCookie } from "../../../requests";
import { ChatContextProvider, ChatReducer, defaultChatContextState } from "./chatContext";
import * as events from '../../../../shared/constants/chat'
import { Channel, PartialChannel } from "../../../dto/channels.dto";

export function ChatContextComponent(props: any)
{
	const { children } = props;

	const [ChatState, ChatDispatch] = useReducer(ChatReducer, defaultChatContextState);
	const [loading, setLoading] = useState(true);

	const socket = useSocket(`${backURL}/chat`,
	{
		reconnectionAttempts: 5,
		reconnectionDelay: 5000,
		autoConnect: false,
		extraHeaders: { "Authorization": "Bearer " + getCookie('jwt') },
	});

	useEffect(() =>
	{
		socket.connect();

		ChatDispatch({type: 'update_socket', payload: socket});

		setupListeners();

		return (() =>
		{
			clearListeners();
		})
	}, []);

	function setupListeners()
	{
		socket.on('handshake', (payload: PartialChannel[]) =>
		{
			console.info('Handshake received from server');
			ChatDispatch({type: 'update_channels', payload});
			setLoading(false);
		});

		socket.on(events.CHANNELS, (payload: PartialChannel[]) =>
		{
			ChatDispatch({type: 'update_channels', payload});
		});

		socket.on(events.NEW_CHANNEL, (payload: Channel) =>
		{
			console.info('new channel event received', payload);
			ChatDispatch({type: 'new_channel', payload});
		})

		socket.on(events.ALERT, (payload: {event: string, args: any}) =>
		{
			socket.emit(payload.event, payload.args);
		})
	}

	function clearListeners()
	{
		socket.off('handshake');
		socket.off(events.CHANNELS);
		socket.off(events.NEW_CHANNEL);
	}

	if (loading)
		return (
			<p>Loading Chat...</p>
		);

	return (
		<ChatContextProvider value={{ChatState, ChatDispatch}}>
			{children}
		</ChatContextProvider>
	)
}
