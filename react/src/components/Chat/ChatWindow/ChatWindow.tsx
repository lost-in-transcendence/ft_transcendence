import
{
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { FaCog } from "react-icons/fa"
import { AiOutlineUserAdd } from "react-icons/ai"
import ChatContext from "../Context/chatContext";
import { Member, MessageDto } from "../dto";
import * as events from "../../../../shared/constants";
import { flushSync } from "react-dom";
import { backURL } from "../../../requests";
import SocketContext from "../../Socket/socket-context";
import Modal from "../../Modal/modal";
import ContextMenuContext from "../ContextMenu/context-menu-context";
import { InviteBox } from "./InviteBox";
import { OwnerBox } from "./OwnerBox";

export function ChatWindow({ className, }: { className?: string, })
{
	const ctx = useContext(ChatContext);
	const mainCtx = useContext(SocketContext);

	const channel = ctx.ChatState.activeChannel;
	if (!channel)
		return <></>
	const users = channel.members;

	const blackList = useContext(SocketContext).SocketState.user.blacklist;
	const mainSocket = mainCtx.SocketState.socket;
	const currentUser = mainCtx.SocketState.user;

	const socket = ctx.ChatState.socket;

	const [ownerBoxIsOpen, setOwnerBoxIsOpen] = useState(false)
	const [inviteBoxIsOpen, setInviteBoxIsOpen] = useState(false)
	const [visibleMessages, setVisibles] = useState<MessageDto[]>([]);
	const [formatedName, setFormatedName] = useState('');

	const selfRef = useRef<HTMLLIElement>(null);

	let isOwner: boolean = false;

	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;

	const isPrivate = channel.mode === "PRIVATE"

	if (channel.mode !== 'PRIVMSG')
	{
		const me = users?.find((m) => m.user?.id === currentUser.id);
		isOwner = me?.role === 'OWNER';
	}

	useEffect(() =>
	{
		socket?.on(events.GET_MESSAGES, (payload: MessageDto[]) =>
		{
			flushSync(() =>
			{
				setVisibles(payload);
			});
		});

		socket?.on(
			events.NOTIFY,
			(payload: { channelId: string; content: string }) =>
			{
				if (payload.channelId === channel.id)
				{
					flushSync(() =>
					{
						setVisibles((prev: MessageDto[]) =>
						{
							const newMessage: MessageDto = {
								channelId: channel.id,
								userId: channel.id,
								content: payload.content,
								createdAt: Date.now(),
								sender: { userName: channel.channelName },
							};
							return [...prev, newMessage];
						});
					});
				}
			}
		);

		mainSocket?.on(events.NOTIFY, (payload: { content: string }) =>
		{
			if (channel)
			{
				flushSync(() =>
				{
					setVisibles((prev: MessageDto[]) =>
					{
						const newMessage: MessageDto = {
							channelId: channel.id,
							userId: channel.id,
							content: payload.content,
							createdAt: Date.now(),
							sender: { userName: channel.channelName },
						};
						return [...prev, newMessage];
					});
				});
			}
		});

		socket?.on(events.TO_CHANNEL, (payload: MessageDto) =>
		{
			if (payload.channelId === channel?.id)
			{
				flushSync(() =>
				{
					setVisibles((prev: MessageDto[]) => [...prev, payload]);
				});
				selfRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
			}
		});

		socket?.emit(events.GET_MESSAGES, { channelId: channel?.id, amount: 50 });

		return () =>
		{
			socket?.off(events.GET_MESSAGES);
			socket?.off(events.NOTIFY);
			mainSocket?.off(events.NOTIFY);
			socket?.off(events.TO_CHANNEL);
		};
	}, [channel.id]);

	useEffect(() =>
	{
		selfRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
	});

	useEffect(() =>
	{
		const handleClick = () => setContextMenu(undefined);
		window.addEventListener("click", handleClick);
		return () =>
		{
			window.removeEventListener("click", handleClick);
		};
	}, []);

	async function leaveChannel()
	{
		await socket?.emit(events.LEAVE_CHANNEL, { channelId: channel?.id });
		ctx.ChatDispatch({ type: "update_active", payload: undefined });
	}

	useEffect(() =>
	{
		let finalName = channel.channelName;
		if (finalName.length > 24)
			finalName = finalName.slice(0, 24) + '...';
		if (channel.mode === "PRIVMSG")
		{
			const userTo = users.find(
				(u: Member) => u.user?.id !== currentUser?.id
			);
			if (userTo)
				setFormatedName(userTo.user.userName);
		}
		else
			setFormatedName(finalName);
	});


	return (
		<>
			<div
				className="channelTitle
								bg-gray-800 text-zinc-400 text-center text-3xl px-1
								shadow-lg
								flex flex-row items-center justify-center"
			>
				<div className="flex items-center justify-between basis-full">
					{
						isPrivate &&
						<>
							<AiOutlineUserAdd
								className="justify-self-start cursor-pointer"
								onClick={() => setInviteBoxIsOpen(true)} />
							<Modal isOpen={inviteBoxIsOpen} onClose={() => setInviteBoxIsOpen(false)}>
								<InviteBox
									onClose={() => setInviteBoxIsOpen(false)}
									channel={channel}
									user={currentUser} />
							</Modal>
						</>

					}
					<span className="flex flex-row justify-center basis-full items-center overflow-hidden">{formatedName}
						{
							isOwner && channel &&
							<>
								<FaCog
									className={"text-green-500 ml-2 cursor-pointer"} size={20}
									onClick={() => setOwnerBoxIsOpen(true)}
								/>
								<Modal isOpen={ownerBoxIsOpen} onClose={() => setOwnerBoxIsOpen(false)}>
									<OwnerBox
										onClose={() => setOwnerBoxIsOpen(false)}
										channel={channel}
									/>
								</Modal>
							</>
						}
					</span>
				</div>
				{channel?.mode !== "PRIVMSG" && (
					<button
						className="basis-0 text-gray-800 px-1 bg-red-800 rounded text-sm"
						onClick={leaveChannel}
					>
						Leave
					</button>
				)}
			</div>
			<div className={className}>
				<ul>
					{visibleMessages.map((m, i, all) =>
					{
						let displayName = false;
						let prevUser;
						const prev = all[i - 1];
						const user = users.find((u) => u.user.id === m.userId);

						// /!\
						// if (!user)
						// 	return;
						// /!\

						if (blackList)
						{
							if (blackList.find((u) => u.id === m.userId))
								return;
						}

						if (prev) prevUser = prev.userId;
						if (prevUser !== m.userId && m.userId !== channel.id)
						{
							displayName = true;
						}
						let dateString: string = '';
						if (displayName === true)
						{
							const date = new Date(m.createdAt);
							const yyyy = date.getFullYear();
							const mm = String(date.getMonth() + 1).padStart(2, '0');
							const dd = String(date.getDate()).padStart(2, '0');
							const hh = String(date.getHours()).padStart(2, '0');
							const mn = String(date.getMinutes()).padStart(2, '0');
							const ss = String(date.getSeconds()).padStart(2, '0');
							dateString = `${dd}/${mm}/${yyyy} at ${hh}:${mn}:${ss}`
						}
						return (
							<li
								key={i}
								ref={i === visibleMessages.length - 1 ? selfRef : null}
								className={`${m.userId === channel.id && "text-yellow-500 font-bold"
									}`}
							>
								{
									displayName &&
									(
										<div
											className="hover:bg-slate-600 cursor-pointer rounded px-1 flex items-center"
											onContextMenu={(e) =>
											{
												if (!user)
													return;
												e.preventDefault();
												setContextMenu({
													x: e.pageX,
													y: e.pageY,
													target: user.user,
													channel: channel
												});
											}}
										>
											<div className="min-w-[48px] basis-12 my-2">
												<span>
													<img
														className="rounded-full h-10 w-10 inline my-auto"
														src={`${backURL}/users/avatars/${m.sender.userName
															}?time=${Date.now()}`}
													/>
												</span>
											</div>
											<div>
												<span className="text-red-900 font-semibold">
													{m.sender.userName}
												</span>
												<p className="text-sm text-gray-300">
													{dateString}
												</p>
											</div>
										</div>
									)
								}
								<>
									<div className="ml-12 overfow-x-hidden break-words">
										<div className="min-w-[48px] basis-12"></div>
										<div>
											<span
												className={`${m.userId !== channel?.id && "px-1 mb-2"}`}
											>
												{m.content}
											</span>
										</div>
									</div>
								</>
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
}
