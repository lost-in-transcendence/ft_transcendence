import { useContext, useEffect, useState } from "react";

import { User } from "../../../dto/users.dto";
import { ChatComposer } from "../ChatComposer/ChatComposer";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { Member } from "../dto";

export function ChatDisplay({ user }: { user: User })
{
	const ctx = useContext(ChatContext);
	const channel = ctx.ChatState.activeChannel;
	const socket = ctx.ChatState.socket;

	const [users, setUsers] = useState<Member[]>([]);

	useEffect(() =>
	{
		console.log('in chatDisplay useEffect');
		socket?.on(events.USERS, (payload: Member[]) =>
		{
			console.log({ payload });
			setUsers(payload);
		})

		socket?.emit(events.USERS, { channelId: channel?.id });
		return (() =>
		{
			socket?.off(events.USERS);
		})
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
