import { useContext, useEffect, useState } from "react";

import { User } from "../../../dto/users.dto";
import { ChatComposer } from "../ChatComposer/ChatComposer";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import ChatContext from "../Context/chatContext";
import * as events from "../../../../shared/constants";
import { Member, PartialUser } from "../dto";
import { ChatRightBar } from "../rightBar/ChatRightBar";
import SocketContext from "../../Socket/socket-context";
import { Channel } from "../../../dto/channels.dto";

export function ChatDisplay({ currentUser }: { currentUser: User,})
{
	const ctx = useContext(ChatContext);
	const mainCtx = useContext(SocketContext);

	const socket = ctx.ChatState.socket;

	const channel = ctx.ChatState.activeChannel;
	const {ChatDispatch} = ctx;

	useEffect(() =>
	{
		socket?.on(events.USERS, (payload: {channelId: string, users: Member[]}) =>
		{
			ChatDispatch({type: "update_active_members", payload: {channelId: payload.channelId, users: payload.users}});
		});

		socket?.on("updateUser", (payload: {id: string, data: PartialUser}) =>
		{
			const { id, data } = payload;
			data.id = id;
			ChatDispatch({type: 'update_active_member', payload: data})
		});

		return () =>
		{
			socket?.off(events.USERS);
			socket?.off("updateUser");
		};
	}, []);

	useEffect(() =>
	{
		socket?.emit(events.USERS, { channelId: channel?.id });
	}, [channel?.id]);

	return (
		<div className="flex flex-row bg-slate-500 h-screen">
			<div className="flex flex-col basis-full overflow-x-hidden">
				<ChatWindow
					className="bg-gray-500 text-gray-50 basis-full overflow-y-auto px-1 py-2"
				/>
				<ChatComposer className="justify-self-end" user={currentUser} />
			</div>
			<ChatRightBar/>
		</div>
	);
}
