import { useContext, useEffect, useState } from "react";

import { User } from "../../../dto/users.dto";
import { ChatComposer } from "../ChatComposer/ChatComposer";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { Member } from "../dto";
import { updateUser } from "../../../requests";

export function ChatDisplay({ user }: { user: User })
{
	const ctx = useContext(ChatContext);
	const channel = ctx.ChatState.activeChannel;
	const socket = ctx.ChatState.socket;

	const [users, setUsers] = useState<Member[]>([]);

	function updateUserInfo(id: string, data: any)
	{
		setUsers((prev) =>
		{
			const index = prev.findIndex((v) => {return v.user.id === id});
			if (index === -1)
				return prev;
			const updated = {...prev};
			const updatedUser = prev[index];
			Object.assign(updateUser, data);
			updated[index] = updatedUser;
			return updated;
		})
	}

	useEffect(() =>
	{
		console.log('in chatDisplay useEffect');
		socket?.on(events.USERS, (payload: Member[]) =>
		{
			console.log({ payload });
			setUsers(payload);
		})

		socket?.on("updateUser", (payload: any) =>
		{
			const {id, data} = payload;
			updateUserInfo(id, data);
		})
		// socket?.on(events.ALERT, (payload: { event: string, args?: string }) =>
		// {
		// 	if (payload.event === events.USERS)
		// 		socket.emit(events.USERS, { channelId: channel?.id });
		// })

		return (() =>
		{
			socket?.off(events.USERS);
		})
	}, [])

	useEffect(() =>
	{
		socket?.emit(events.USERS, { channelId: channel?.id });	
	}, [channel])

	return (
		<div className="flex flex-row bg-slate-500 h-screen">
			<div className="flex flex-col basis-full overflow-x-hidden">
				<ChatWindow users={users} className="bg-slate-400 basis-full overflow-y-auto px-1 py-2" />
				<ChatComposer className="justify-self-end"
					user={user} />
			</div>
			<div className="bg-orange-300 w-60 overflow-hidden break-words">
				<ul>
					{
						users.map((u: Member, i) =>
						{
							const user = u.user;
							return (
									<li key={i} className='text-center'>
										<p>{user.userName} - {user.status}</p>
										<p>{u.role}</p>
										<p>{user.gameStatus}</p>
										<br/>
									</li>
							)
						})
					}
				</ul>
			</div>
		</div>
	)
}
