import
{
	ChangeEvent,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { GiConsoleController } from "react-icons/gi";
import { FaCog } from "react-icons/fa"
import { RiCheckboxBlankCircleLine as Unchecked, RiCheckboxCircleLine as Checked } from 'react-icons/ri'
import { AiOutlineUserAdd } from "react-icons/ai"

import { Channel } from "../../../dto/channels.dto";
import ChatContext from "../Context/chatContext";
import { Member, MessageDto } from "../dto";
import * as events from "../../../../shared/constants";
import { flushSync } from "react-dom";
import { backURL } from "../../../requests";
import SocketContext from "../../Socket/socket-context";
import Modal from "../../Modal/modal";
import { User } from "../../../dto/users.dto";
import ContextMenuContext from "../ContextMenu/context-menu-context";

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
	// const [display, setDisplay] = useState<ContextMenuData | undefined>(undefined);
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
				// console.clear();
				console.log({ payload });
				if (payload.channelId === channel.id)
				{
					flushSync(() =>
					{
						setVisibles((prev) =>
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
					setVisibles((prev) =>
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
					setVisibles((prev) => [...prev, payload]);
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
		if (channel.mode === "PRIVMSG")
		{
			const userTo = users.find(
				(u: Member) => u.user?.id !== currentUser?.id
			);
			if (userTo)
				setFormatedName(userTo.user.userName);
		}
		else
			setFormatedName(channel.channelName);
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
			{/* {display && (
				<ContextMenu
					x={display.x}
					y={display.y}
					target={display.target}
					channel={display.channel}
				/>
			)} */}
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
						return (
							<li
								key={i}
								ref={i === visibleMessages.length - 1 ? selfRef : null}
								className={`overflow-x-hidden break-words ${m.userId === channel.id && "text-yellow-500 font-bold"
									}`}
							>
								{
									displayName && (
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
												{/* <br /> */}
												{/* <span className={`${m.userId !== channel?.id && "mb-2"}`}>
										{m.content} */}
												{/* </span> */}
											</div>
										</div>
									)
								}
								<>
									<div className="flex">
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

function InviteBox({ channel, user, onClose }: { channel: Channel, user: User, onClose: Function })
{
	const mainSocket = useContext(SocketContext).SocketState.socket
	const chatSocket = useContext(ChatContext).ChatState.socket;

	const [friends, setFriends] = useState<{ id: string, userName: string, checked: boolean }[]>([])

	useEffect(() =>
	{
		mainSocket?.on(events.GET_FRIENDLIST, (payload: { id: string, userName: string }[]) =>
		{
			const invitables = payload.filter((p) => !channel.members.find((m) => m.user.id === p.id))
			setFriends(invitables.map((p) => ({ ...p, checked: false })));
		})
		mainSocket?.emit(events.GET_FRIENDLIST, { userId: user.id })

		return (() =>
		{
			mainSocket?.off(events.GET_FRIENDLIST);
		})
	}, [])

	function onCheck(checked: boolean, userId: string)
	{
		setFriends((prev) =>
		{
			const newArray = prev.map((p) =>
			{
				if (p.id === userId)
					return { ...p, checked: !p.checked }
				return { ...p }
			})
			return newArray
		})
	}

	function onSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>)
	{
		e.preventDefault();
		const usersToInvite: string[] = [];
		for (let f of friends)
		{
			if (f.checked)
				usersToInvite.push(f.id);
		}
		if (usersToInvite.length <= 0)
		{
			onClose();
			return;
		}
		chatSocket?.emit(events.INVITE_TO_PRIVATE_CHANNEL, { usersToInvite, channelId: channel.id });
		onClose();
	}

	return (
		<div className="flex flex-col items-center justify-center">
			{
				friends.length > 0 ?
					<>
						<div className="bg-gray-400 rounded shadow-inner max-h-96 w-11/12 text-center overflow-auto p-2">
							{
								friends.map((f) =>
								{
									return (
										<div
											key={f.id}
											className="flex items-center justify-around cursor-pointer rounded hover:bg-slate-700 hover:text-gray-100"
											onClick={() => onCheck(f.checked, f.id)}
										>
											<span>{f.userName}</span>
											<CheckBox checked={f.checked} />
										</div>
									)
								})
							}

						</div>
						<button
							className="bg-indigo-300 w-24 mt-2"
							onClick={(e) => onSubmit(e)}
						>
							Invite
						</button>
					</>
				:
				<p>No friends to invite</p>
			}
		</div>
	)
}

function CheckBox({ checked = false }: { checked: boolean })
{
	return (
		checked ? <Checked /> : <Unchecked />
	)
}

function OwnerBox({ onClose, channel }: { onClose: any, channel: Channel })
{
	const [data, setData] = useState<{ channelId: string, channelName?: string; mode?: string; password?: string; }>({ channelId: channel.id });
	const [bannedUsers, setbannedUsers] = useState<Member[]>([]);
	const socket = useContext(ChatContext).ChatState.socket;

	const ctx = useContext(ChatContext);

	function updateChannel(e: any)
	{
		e.preventDefault();
		ctx.ChatState.socket?.emit(events.UPDATE_CHANNEL_INFO, data);
		// onClose();
	}

	useEffect(() =>
	{
		console.log({ bannedUsers });
	})

	useEffect(() =>
	{
		socket?.on(events.GET_BANNED_USERS, (payload: Member[]) =>
		{
			setbannedUsers(payload);
		})

		socket?.emit(events.GET_BANNED_USERS, { channelId: channel.id });
		return (() =>
		{
			socket?.off(events.GET_BANNED_USERS);
		})
	}, [])

	if (!channel)
	{
		onClose();
		return <></>
	}

	return (
		<>
			<h1 className="text-center mb-3" >Channel Settings</h1>
			<form className="flex flex-col" onSubmit={updateChannel}>
				<label className="flex flex-row justify-between p-2">
					<p>Channel Name</p>
					<input
						type={"text"}
						onChange={(e) => setData({ ...data, channelName: e.target.value })}
						className="basis-1/2 rounded shadow"
						defaultValue={channel.channelName}
					/>
				</label>
				<label className="flex flex-row justify-between p-2">
					<p>Mode</p>
					<select
						className="basis-1/2 rounded shadow"
						name="mode"
						defaultValue={channel.mode}
						onChange={(e) =>
							setData({ ...data, mode: e.target.value })
						}
					>
						<option value={"PUBLIC"}>Public</option>
						<option value={"PRIVATE"}>Private</option>
						<option value={"PROTECTED"}>Password protected</option>
					</select>
				</label>
				{data.mode === "PROTECTED" && (
					<label className="flex flex-row justify-between p-2">
						<p>Password</p>
						<input
							type={"text"}
							onChange={(e) => setData({ ...data, password: e.target.value })}
							className="basis-1/2 rounded shadow"
							placeholder="Password"
						/>
					</label>
				)}
				<input
					type={"submit"}
					value={'Update Channel Infos'}
					className="bg-indigo-300 shadow border rounded self-center px-2"
				/>
			</form>
			{
				(bannedUsers && bannedUsers.length > 0) ?
					<form className="flex flex-row gap-2 justify-between items-center p-2">
						<label className="basis-full">
							Banned
							<select className="ml-2 rounded shadow">
								{
									bannedUsers.map((u: Member) =>
									{
										return (
											<option key={u.user.id}>
												{u.user.userName}
											</option>
										)

									})
								}
							</select>
						</label>
						<input
							type={'submit'}
							value={'Unban'}
							className='bg-indigo-300 rounded border px-2 h-6'
						/>
					</form>
					:
					null
			}
		</>
	);
}
