import { FormEvent, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SocketContext from "../../Socket/socket-context";
import { BanMemberDto, ContextMenuData, Member, PartialUser } from "../dto";
import * as events from '../../../../shared/constants'
import ChatContext from "../Context/chatContext";
import { Channel } from "../../../dto/channels.dto";
import Modal from "../../Modal/modal";
import { addFriend, removeFriend } from "../../../requests";
import ContextMenuContext from "./context-menu-context";

export function ContextMenu({ x, y, channel, target }: ContextMenuData)
{
	const mainCtx = useContext(SocketContext);
	const chatCtx = useContext(ChatContext);

	const mainSocket = mainCtx.SocketState.socket;
	const chatSocket = chatCtx.ChatState.socket;

	const blacklist = mainCtx.SocketState.user.blacklist;
	const friendlist = mainCtx.SocketState.user.friends;

	const currentUser = mainCtx.SocketState.user;

	let isAdmin: boolean = false;
	let isOwner: boolean = false;

	let targetIsAdmin: boolean = false;
	let targetIsOwner: boolean = false;

	const targetId = target.id;
	const userName = target.userName;
	// NEED TO FIND A WAY TO GET THIS INFO
	const [banBoxIsOpen, setBanBoxIsOpen] = useState(false)
	const [mutBoxIsOpen, setMuteBoxIsOpen] = useState(false)


	const channels = chatCtx.ChatState.visibleChannels;

	const isInBlacklist: boolean = blacklist?.find((u) => u.id === targetId) ? true : false;
	const isInFriendList: boolean = friendlist?.find((u) => u.id === targetId) ? true : false;

	const navigate = useNavigate();

	if (channel && channel.mode !== 'PRIVMSG')
	{
		const me = channel.members.find((m) => m.user?.id === currentUser.id);
		if (me)
		{
			if (me.role === "OWNER" || me.role === "ADMIN")
			isAdmin = true
			if (me.role === "OWNER")
			isOwner = true;
		}
		const targetMember = channel.members.find((m) => m.user.id === targetId)
		if (targetMember)
		{
			if (targetMember.role === "ADMIN")
				 targetIsAdmin = true;
			else if (targetMember.role === "OWNER")
				targetIsOwner = true;
		}
	}

	function goToProfile(userName: string)
	{
		navigate(`/profile/view/${userName}`);
	}

	// function banUser()
	// {
	// 	mainSocket?.emit(events.BAN_USER, { userId: targetId, channelId: channel?.id })
	// }

	// function unbanUser()
	// {
	// 	mainSocket?.emit(events.UNBAN_USER, { userId: targetId, channelId: channel?.id })
	// }

	function blockUser()
	{
		mainSocket?.emit(events.BLOCK_USER, { userId: targetId });
	}

	function unblockUser()
	{
		mainSocket?.emit(events.UNBLOCK_USER, { userId: targetId });
	}

	function promoteUser()
	{
		chatSocket?.emit(events.PROMOTE_USER, { channelId: channel?.id, userId: targetId });
	}

	function demoteUser()
	{
		chatSocket?.emit(events.DEMOTE_USER, { channelId: channel?.id, userId: targetId });
	}

	function sendPrivmsg()
	{
		const channelName = targetId > currentUser.id ? targetId + '_' + currentUser.id : currentUser.id + '_' + targetId;
		const channelExists: Channel | undefined = channels.find((c) => c.channelName === channelName);

		if (!channelExists)
			chatCtx.ChatState.socket?.emit(events.NEW_PRIVMSG, { userId: targetId });
		chatCtx.ChatDispatch({ type: 'update_active', payload: channelExists });
	}
	
	async function toggleFriend(id: string, isInFriendList: boolean)
	{
		let toggleFunc: Function = isInFriendList ? removeFriend : addFriend;
		if (await toggleFunc(id) === true)
			mainSocket?.emit("changeFriends");
	}


	const liClassName: string =
		'hover:bg-indigo-600 cursor-pointer rounded text-white';

	return (
		<ul
			className={`list-none w-48 rounded p-2 bg-zinc-800 fixed overflow-hidden z-[250]`}
			style={{ top: `${y}px`, left: `${x}px` }}
		>
			<li
				className={liClassName}
				onClick={() =>
				{
					goToProfile(userName);
				}}
			>
				Profile
			</li>
			{
				currentUser.id !== targetId &&
				<>
					<li className={liClassName}>Invite to play</li>
					<li
					className={liClassName}
					onClick={() => toggleFriend(targetId, isInFriendList)}
					>
						{isInFriendList ? 'Remove' : 'Add'} Friend
					</li>
					<li className={liClassName}>Invite to channel</li>
					<li
						className={liClassName}
						onClick={sendPrivmsg}
						>
						Direct Message
					</li>
						{
							isInBlacklist ?
								<li
									className={liClassName}
									onClick={unblockUser}
								>
									Unblock
								</li>
								:
								<li
									className={liClassName}
									onClick={blockUser}
								>
									Block
								</li>
						}
					{
						channel ?
						<>
							<hr className="border-gray-700" />
						{
							
							isOwner &&
							(
								targetIsAdmin ?
								<li
									className={liClassName}
									onClick={demoteUser}
									>
									Demote
									</li>
								:
								<li
								className={liClassName}
								onClick={promoteUser}
								>
									Promote
								</li>
							)
						}
						{
							isAdmin && !targetIsOwner &&
							<li className={liClassName}
							onClick={(e) => { e.stopPropagation(); setBanBoxIsOpen(true) }}
							>
								<Modal isOpen={banBoxIsOpen} onClose={() => setBanBoxIsOpen(false)}>
									<BanBox
										onClose={() => setBanBoxIsOpen(false)}
										channel={channel}
										target={target}
										action='BAN'
										/>
								</Modal>
								Ban
							</li>
						}
						{
							isAdmin && !targetIsOwner &&
							<li className={liClassName}
								onClick={(e) => { e.stopPropagation(); setMuteBoxIsOpen(true) }}
								>
								<Modal isOpen={mutBoxIsOpen} onClose={() => setMuteBoxIsOpen(false)}>
									<BanBox
										onClose={() => setMuteBoxIsOpen(false)}
										channel={channel}
										target={target}
										action='MUTE'
										/>
								</Modal>
								Mute
							</li>
						}
						</>
						:
						<></>
					}
					{/* <hr className="border-gray-700" />
					{
						channel ?
						<> 
						{
							isOwner &&
							(
								targetIsAdmin ?
									<li
									className={liClassName}
									onClick={demoteUser}
									>
										Demote
									</li>
									:
									<li
									className={liClassName}
									onClick={promoteUser}
									>
										Promote
									</li>
							)
						}
						{
							isAdmin &&
							<li className={liClassName}
								onClick={(e) => { e.stopPropagation(); setBanBoxIsOpen(true) }}
							>
								<Modal isOpen={banBoxIsOpen} onClose={() => setBanBoxIsOpen(false)}>
									<BanBox
									onClose={() => setBanBoxIsOpen(false)}
									channel={channel}
									target={target}
									action='BAN'
									/>
								</Modal>
								Ban
							</li>
						}
						{
							isAdmin &&
							<li className={liClassName}
								onClick={(e) => { e.stopPropagation(); setMuteBoxIsOpen(true) }}
							>
								<Modal isOpen={mutBoxIsOpen} onClose={() => setMuteBoxIsOpen(false)}>
									<BanBox
									onClose={() => setMuteBoxIsOpen(false)}
									channel={channel}
									target={target}
									action='MUTE'
									/>
								</Modal>
								Mute
							</li>
						}
						</>
						:
						<></>
					} */}
				</>
			}
		</ul>
	);
}

function BanBox({ onClose, channel, target, action }: { onClose: any, channel: Channel, target: PartialUser, action: 'BAN' | 'MUTE' })
{
	const {socket} = useContext(ChatContext).ChatState;

	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;

	const [data, setData] = useState<{ time: number, timeUnit: string }>({ time: 1, timeUnit: "sec" })

	function submitForm(e: FormEvent)
	{
		console.log({ data });
		e.preventDefault();
		let finalTime = data.time;

		switch (data.timeUnit)
		{
			case 'day':
				finalTime *= 24;
			case 'hour':
				finalTime *= 60;
			case 'min':
				finalTime *= 60;
			case 'sec':
				finalTime *= 1000;
				break;
			default:
				return;
		}
		const banParams: BanMemberDto = { userId: target.id, channelId: channel.id, banTime: finalTime, userName: target.userName };
		if (action === 'BAN')
			socket?.emit(events.BAN_USER, banParams);
		else
			socket?.emit(events.MUTE_USER, banParams)
		setContextMenu(undefined);
		onClose();
	}

	useEffect(() =>
	{
		console.log('in BanBox Action: ' + action);
	})

	return (
		<>
			<h1 className="text-center mb-3" >{action === 'BAN' ? "Ban" : "Mute"} {target.userName}</h1>
			<form className="flex flex-col" onSubmit={submitForm}>
				<label className="flex flex-row justify-around items-end p-2">
					<p className="basis-0">Duration</p>
					<div className='basis-full flex flex-col items-center justify-center'>
						<p>{data.time}</p>
						<input
						className="w-11/12"
							type={"range"}
							min={1}
							max={60}
							value={data.time}
							onChange={(e) => setData({ ...data, time: parseInt(e.target.value, 10) })}
						/>

					</div>
					<select
						className="rounded shadow basis-0"
						name="time"
						value={data.timeUnit}
						onChange={(e) =>
							setData({ ...data, timeUnit: e.target.value })
						}
					>
						<option value={"sec"}>sec</option>
						<option value={"min"}>min</option>
						<option value={"hour"}>hour</option>
						<option value={"day"}>day</option>
					</select>
				</label>
				<input
					type={"submit"}
					name="Submit"
					className="bg-indigo-300 shadow border w-1/4 rounded self-center"
				/>
			</form>

		</>
	)
}
