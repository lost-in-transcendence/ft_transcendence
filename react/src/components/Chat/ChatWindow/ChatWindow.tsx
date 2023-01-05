import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Channel } from "../../../dto/channels.dto";
import ChatContext from "../Context/chatContext";
import { MessageDto } from "../dto";
import * as events from "../../../../shared/constants"
import { Socket } from "socket.io-client";
import { flushSync } from "react-dom";
import { backURL } from "../../../requests";

export function ChatWindow({ className, users }: { users: any[], className?: string })
{
	const ctx = useContext(ChatContext);
	const socket = ctx.ChatState.socket;
	const channel = ctx.ChatState.activeChannel;

	const [visibleMessages, setVisibles] = useState<MessageDto[]>([]);

	const selfRef = useRef<HTMLLIElement>(null);

	useEffect(() =>
	{
		socket?.on(events.GET_MESSAGES, (payload: MessageDto[]) =>
		{
			flushSync(() =>
			{
				setVisibles(payload);
			})
		})

		socket?.on(events.NOTIFY, (payload: { channelId: string, content: string }) =>
		{
			console.log('received notify', { payload });
			if (channel && payload.channelId === channel.id)
			{
				flushSync(() =>
				{
					setVisibles((prev) =>
					{
						const newMessage: MessageDto =
						{
							channelId: channel.id,
							userId: channel.id,
							content: payload.content,
							createdAt: Date.now(),
							sender: { userName: channel.channelName }
						}
						return ([...prev, newMessage])
					})
				})
			}
		})

		socket?.on(events.TO_CHANNEL, (payload: MessageDto) =>
		{
			if (payload.channelId === channel?.id)
			{
				flushSync(() =>
				{
					setVisibles((prev) => [...prev, payload]);
				})
				selfRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
			}
		})

		socket?.emit(events.GET_MESSAGES, { channelId: channel?.id, amount: 50 });

		return (() =>
		{
			socket?.off(events.GET_MESSAGES);
			socket?.off(events.TO_CHANNEL);
			socket?.off(events.NOTIFY);
			// socket?.offAny();
		})
	}, [channel])

	useEffect(() => { selfRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) })

	async function leaveChannel()
	{
		await socket?.emit(events.LEAVE_CHANNEL, { channelId: channel?.id });
		ctx.ChatDispatch({ type: 'update_active', payload: undefined });
	}

	return (
		<>
			<div className="channelTitle
								bg-gray-800 text-zinc-400 text-center text-3xl px-1
								shadow-lg
								flex flex-row items-center justify-center">
				<span className="overflow-hidden basis-full">
					{channel?.channelName}
				</span>
				<button className="basis-0 text-gray-800 px-1 bg-red-800 rounded text-sm" onClick={leaveChannel}>
					Leave
				</button>
			</div>
			<div className={className} >
				<ul>
					{
						visibleMessages.map((m, i, all) =>
						{
							let displayName = false;
							let prevUser;
							const prev = all[i - 1];

							if (prev)
								prevUser = prev.userId;
							if (prevUser != m.userId && m.userId != channel?.id)
							{
								displayName = true;
							}
							return (
								<li
									key={i}
									ref={i === visibleMessages.length - 1 ? selfRef : null}
									className={`overflow-x-hidden break-words ${m.userId === channel?.id && 'text-yellow-500 font-bold'}`}
								>
									{
										displayName &&
										<>
											<span>
												<img className="rounded-full h-14 w-14 inline mt-3 mb-1 mr-2"
												src={`${backURL}/users/avatars/${m.sender.userName}?time=${Date.now()}`} />
											</span>
											<span className="text-red-600 font-semibold">{m.sender.userName}</span>
											<br />
										</>
									}
									<span className={`${m.userId !== channel?.id && 'px-1 mb-'}`}>{m.content}</span>
								</li>
							)
						})
					}
				</ul>
			</div>
		</>
	)
}
