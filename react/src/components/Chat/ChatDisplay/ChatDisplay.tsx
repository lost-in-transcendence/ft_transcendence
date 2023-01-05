import { useContext, useEffect, useState } from "react";

import { User } from "../../../dto/users.dto";
import { ChatComposer } from "../ChatComposer/ChatComposer";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { backURL } from "../../../requests";
import { useNavigate } from "react-router-dom";

export function ChatDisplay({ user }: { user: User })
{
	const ctx = useContext(ChatContext);
	const channel = ctx.ChatState.activeChannel;
	const socket = ctx.ChatState.socket;

	const [users, setUsers] = useState([]);
	const navigate = useNavigate();

	const goToProfile = (userName: string) => {
		navigate('/profile/view/' + userName)
	}

	useEffect(() =>
	{
		console.log('in chatDisplay useEffect');
		socket?.on(events.USERS, (payload: any) =>
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
			<div className="bg-zinc-700 w-60 overflow-hidden break-words">
				<li className={"ml-2 text-zinc-400"}>
					ONLINE
				</li>
				<ul>
					{
						users.map((u: any, i) =>
						{
							const user = u.user;
							if (user.status === 'ONLINE')
								return (
									<div>
										<span key={i} 
										onClick={goToProfile(user.userName)}
										className='overflow-x-hidden'>
											<img className="float-left rounded-full h-10 w-10 inline mt-3 mb-2 mr-2"
											src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
											<span className={"flex mt-5 "}> {user.userName} </span>
											<span>{u.role}</span>
											<br/>
											<br/>
										</span>
									</div>
								)
						})
					}
				</ul>
				<li className={"mt-5 ml-2 text-zinc-400"}>
					OFFLINE
				</li>
				<ul>
					{
						users.map((u: any, i) =>
						{
							const user = u.user;
							if (user.status === 'OFFLINE')
								return (
									<div>
										<span key={i} className='text-center inline mt-5 mb-1 mr-2'>
											<img className="float-left rounded-full h-14 w-14"
											src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
											<p> {user.userName} </p>
											<p>{u.role}</p>
											<br/>
										</span>
									</div>
								)
						})
					}
				</ul>
			</div>
		</div>
	)
}
