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

export function ChatDisplay({ currentUser, channel }: { currentUser: User, channel: Channel })
{
	const ctx = useContext(ChatContext);
	const mainCtx = useContext(SocketContext);

	const socket = ctx.ChatState.socket;

	const users = ctx.ChatState.activeChannel? ctx.ChatState.activeChannel.members : [];
	// const [users, setUsers] = useState<Member[]>([]);
	const {ChatDispatch} = ctx;

	useEffect(() =>
	{
		socket?.on(events.USERS, (payload: Member[]) =>
		{
			ChatDispatch({type: "update_active_members", payload});
		});

		socket?.on("updateUser", (payload: {id: string, data: PartialUser}) =>
		{
			const { id, data } = payload;
			data.id = id;
			ChatDispatch({type: 'update_active_member', payload: data})
		});

		// socket?.emit(events.USERS, { channelId: channel?.id });
		return () =>
		{
			socket?.off(events.USERS);
		};
	}, []);

	useEffect(() =>
	{
		socket?.emit(events.USERS, { channelId: channel?.id });
	}, [channel.id]);

	// useEffect(() =>
	// {
	// 	// const handleClick = () => setDisplay(false);
	// 	// window.addEventListener("click", handleClick);
	// 	// return () => window.removeEventListener("click", handleClick);
	// }, []);

	return (
		<div className="flex flex-row bg-slate-500 h-screen">
			<div className="flex flex-col basis-full overflow-x-hidden">
				<ChatWindow
					users={users}
					className="bg-slate-400 basis-full overflow-y-auto px-1 py-2"
					channel={channel}
				/>
				<ChatComposer className="justify-self-end" user={currentUser} />
			</div>
			<ChatRightBar users={users} channel={channel}/>
		</div>
	);
}
