import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import SocketContext from "../../Socket/socket-context";
import { ContextMenuData } from "../dto";
import { Member } from "../dto";
import * as events from '../../../../shared/constants'
import ChatContext from "../Context/chatContext";
import { Channel } from "../../../dto/channels.dto";

export function ContextMenu({ x, y, channel, target }: ContextMenuData)
{
	const mainCtx = useContext(SocketContext);
	const chatCtx = useContext(ChatContext);

	const mainSocket = mainCtx.SocketState.socket;
	const chatSocket = chatCtx.ChatState.socket;

	const blacklist = mainCtx.SocketState.user.blacklist;
	const currentUser = mainCtx.SocketState.user;

	let isAdmin: boolean = false;
	let isOwner: boolean = false;

	const targetId = target.user.id;
	const userName = target.user.userName;

	if (channel.mode !== 'PRIVMSG')
	{
		const me = channel.members?.find((m) => m.user?.id === currentUser.id);
		if(me.role === "OWNER" || me.role === "ADMIN")
			isAdmin = true
		if (me.role === "OWNER")
			isOwner = true;
	}
	// NEED TO FIND A WAY TO GET THIS INFO



	const channels = chatCtx.ChatState.visibleChannels;

	const isInBlacklist: boolean = blacklist?.find((u) => u.id === targetId) ? true : false;

	const navigate = useNavigate();

	function goToProfile(userName: string)
	{
		navigate(`/profile/view/${userName}`);
	}

	function banUser()
	{
		mainSocket?.emit(events.BAN_USER, {userId: targetId, channelId: channel.id})
	}

	function unbanUser()
	{
		mainSocket?.emit(events.UNBAN_USER, {userId: targetId, channelId: channel.id})
	}

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
		chatSocket?.emit(events.PROMOTE_USER, { channelId: channel.id, userId: targetId });
	}

	function demoteUser()
	{
		chatSocket?.emit(events.DEMOTE_USER, { channelId: channel.id, userId: targetId });
	}

	function sendPrivmsg()
	{
		const channelName = targetId > currentUser.id ? targetId + '_' + currentUser.id : currentUser.id + '_' + targetId;
		const channelExists: Channel | undefined = channels.find((c) => c.channelName === channelName);

		if (!channelExists)
			chatCtx.ChatState.socket?.emit(events.NEW_PRIVMSG, {userId: targetId});
		chatCtx.ChatDispatch({type: 'update_active', payload: channelExists});
	}

	const liClassName: string =
		"hover:bg-indigo-600 rounded cursor-pointer text-white";

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
					<li className={liClassName}>[conditional friend]</li>
					<li className={liClassName}>Invite to channel</li>
					<li
						className={liClassName}
						onClick={sendPrivmsg}
					>
						Direct Message
					</li>
					<hr className="border-gray-700"/>
					{
						isOwner &&
						(
							target.role === 'ADMIN' ?
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
					{ isAdmin &&
						<li
							className={liClassName}
							onClick={banUser}
						>
							ban
						</li>
					}
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
				</>
			}
		</ul>
	);
}
