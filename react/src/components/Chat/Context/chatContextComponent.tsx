import { useEffect, useReducer, useState } from "react";

import { useSocket } from "../../../hooks/use-socket";
import { backURL, getCookie } from "../../../requests";
import { ChatContextProvider, ChatReducer, defaultChatContextState } from "./chatContext";
import * as events from '../../../../shared/constants/chat'
import { Channel, PartialChannel } from "../../../dto/channels.dto";
import { Spinner } from "../../Spinner/Spinner";

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

		ChatDispatch({ type: 'update_socket', payload: socket });

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
			ChatDispatch({ type: 'update_channels', payload });
			setLoading(false);
		});

		socket.on(events.CHANNELS, (payload: PartialChannel[]) =>
		{
			if (payload)
			{
				ChatDispatch({ type: 'update_channels', payload });
			}
		});

		socket.on(events.NEW_CHANNEL, (payload: Channel) =>
		{
			ChatDispatch({ type: 'new_channel', payload });
		})

		socket.on(events.UPDATE_ACTIVE_CHAN, (payload: Channel) =>
		{
			ChatDispatch({ type: 'update_active', payload });
		})

		socket.on(events.ALERT, (payload: { event: string, args: any }) =>
		{
			if (payload.event === events.USERS && !payload.args)
				socket.emit(payload.event, { channelId: ChatState.activeChannel?.id })
			else
				socket.emit(payload.event, payload.args);
		})
	}

	function clearListeners()
	{
		socket.off('handshake');
		socket.off(events.CHANNELS);
		socket.off(events.NEW_CHANNEL);
		socket.off(events.UPDATE_ACTIVE_CHAN);
		socket.off(events.ALERT);
	}

	if (loading)
		return (
			<div className="flex flex-col justify-center items-center h-full w-full">
				<h1 className="text-indigo-300 mb-2 text-3xl">Loading SocketIO ...</h1>
				<Spinner />
			</div>
		);

	return (
		<ChatContextProvider value={{ ChatState, ChatDispatch }}>
			{children}
		</ChatContextProvider>
	)
}
