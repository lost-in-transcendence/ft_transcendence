import { useContext, useEffect, useState } from "react";

import { User } from "../../../dto/users.dto";
import { ChatComposer } from "../ChatComposer/ChatComposer";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { Member } from "../dto";
import { backURL } from "../../../requests";
import { ChatRightBar } from "../rightBar/ChatRightBar";
import { ContextMenu } from "../rightBar/ContextMenu";

import SocketContext from "../../Socket/socket-context";

export function ChatDisplay({ currentUser }: { currentUser: User })
{
	const ctx = useContext(ChatContext);
	const mainCtx = useContext(SocketContext);

	const channel = ctx.ChatState.activeChannel;
	const socket = ctx.ChatState.socket;

	const mainSocket = mainCtx.SocketState.socket;
	const blackList = mainCtx.SocketState.user.blacklist;

	const [users, setUsers] = useState<Member[]>([]);

	const [pos, setPos] = useState({ x: 0, y: 0 })
	const [display, setDisplay] = useState(false)

	useEffect(() => {
		console.log('in chatDisplay useEffect');
		socket?.on(events.USERS, (payload: Member[]) =>
		{
			console.log({ payload });
			setUsers(payload);
		})

		// socket?.on(events.ALERT, (payload: { event: string, args?: string }) =>
		// {
		// 	if (payload.event === events.USERS)
		// 		socket.emit(events.USERS, { channelId: channel?.id });
		// })

		socket?.emit(events.USERS, { channelId: channel?.id });
		return (() => {
			socket?.off(events.USERS);
		})
	}, [])

	useEffect(() => { socket?.emit(events.USERS, { channelId: channel?.id }); }, [channel]);

	function blockUser(userId: string)
	{
		mainSocket?.emit(events.BLOCK_USER, { userId });
	}

	function unblockUser(userId: string)
	{
		mainSocket?.emit(events.UNBLOCK_USER, { userId });
	}

	useEffect(() => {
		const handleClick = () => setDisplay(false);
		window.addEventListener('click', handleClick)
		return () => window.removeEventListener('click', handleClick)
	}, [])

	return (
		<div className="flex flex-row bg-slate-500 h-screen">
			<div className="flex flex-col basis-full overflow-x-hidden">
				<ChatWindow users={users} className="bg-slate-400 basis-full overflow-y-auto px-1 py-2" />
				<ChatComposer className="justify-self-end"
					user={currentUser} />
			</div>
				<div className="bg-zinc-700 w-60 overflow-hidden break-words">
					<h3 className={"ml-2 mt-2 text-zinc-400"}>
						ONLINE
					</h3>
					<ul>
						{
							users.map((u: Member, i) => {
								const user = u.user;
								if (user.status === 'ONLINE')
									return (
										<div
											key={i}>
											<span
												onContextMenu={(e) => {
													e.preventDefault()
													setDisplay(true)
													setPos({ x: e.pageX, y: e.pageY })
												}}
												className='flex rounded items-center ml-2 mr-2 hover:bg-zinc-400 cursor-pointer'>
												{display && <ContextMenu x={pos.x} y={pos.y} userName={user.userName} />}
												<img className="float-left rounded-full h-10 w-10 inline mt-3 mb-2 mr-2"
													src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
												<div className="flex flex-col justify-center items-center">
													<span> {user.userName} </span>
													<span>{u.role}</span>
													<br />
													<br />
												</div>
											</span>
										</div>
									)
							})
						}
					</ul>
					<h3 className={"mt-5 ml-2 text-zinc-400"}>
						OFFLINE
					</h3>
					<ul>
						{
							users.map((u: any, i) => {
								const user = u.user;
								if (user.status === 'OFFLINE')
									return (
										<div
											key={i}>
											<span
												onContextMenu={(e) => {
													e.preventDefault()
													setDisplay(true)
													setPos({ x: e.pageX, y: e.pageY })
												}}
												className='flex items-center ml-2 mr-2 hover:bg-zinc-400 cursor-pointer'>
												{display && <ContextMenu x={pos.x} y={pos.y} userName={user.userName} />}
												<img className="float-left rounded-full h-10 w-10 inline mt-3 mb-2 mr-2"
													src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
												<div className="flex flex-col justify-center items-center">
													<span> {user.userName} </span>
													<span>{u.role}</span>
													<br />
													<br />
												</div>
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
