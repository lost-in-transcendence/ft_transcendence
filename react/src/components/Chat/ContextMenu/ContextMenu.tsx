import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SocketContext from "../../Socket/socket-context";
import { ContextMenuData } from "../dto";
import * as events from '../../../../shared/constants'
import ChatContext from "../Context/chatContext";
import { Channel } from "../../../dto/channels.dto";
import Modal from "../../Modal/modal";
import { addFriend, removeFriend } from "../../../requests";
import { BanBox } from "./BanBox";
import ContextMenuContext from "./context-menu-context";

export function ContextMenu({ x, y, channel, target }: ContextMenuData) {
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

	const [banBoxIsOpen, setBanBoxIsOpen] = useState(false)
	const [mutBoxIsOpen, setMuteBoxIsOpen] = useState(false)

	const channels = chatCtx.ChatState.visibleChannels;

	const isInBlacklist: boolean = blacklist?.find((u) => u.id === targetId) ? true : false;
	const isInFriendList: boolean = friendlist?.find((u) => u.id === targetId) ? true : false;

	const ref = useRef<HTMLUListElement>(null)
	const navigate = useNavigate();

	const [finalX, setFinalX] = useState<number>(x);
	const [finalY, setFinalY] = useState<number>(y);
	
	useEffect(() =>
	{
		if (!ref || !ref.current)
			return;
		const { innerWidth: width, innerHeight: height } = window;
		const {scrollWidth, scrollHeight} = ref.current;
		if (x >= width - scrollWidth)
			setFinalX(width-scrollWidth);
		else
			setFinalX(x);
		if (y >= height - scrollHeight)

			setFinalY(height - scrollHeight);
		else
			setFinalY(y)
	}, [ref, x, y])
	

	if (channel && channel.mode !== 'PRIVMSG') {
		const me = channel.members.find((m) => m.user?.id === currentUser.id);
		if (me) {
			if (me.role === "OWNER" || me.role === "ADMIN")
				isAdmin = true
			if (me.role === "OWNER")
				isOwner = true;
		}
		const targetMember = channel.members.find((m) => m.user.id === targetId)
		if (targetMember) {
			if (targetMember.role === "ADMIN")
				targetIsAdmin = true;
			else if (targetMember.role === "OWNER")
				targetIsOwner = true;
		}
	}

	function goToProfile(userName: string) {
		navigate(`/profile/view/${userName}`);
	}

	function inviteToGame() {
		navigate('/game?' + new URLSearchParams({ 'action': 'invitePlayer', 'userName': target.userName }));
	}

	function spectateGame() {
		navigate('/game?' + new URLSearchParams({ 'action': 'spectateGame', 'userName': target.userName }));
	}

	async function blockUser(targetId: string) {
		if (isInFriendList) {
			await removeFriend(targetId)
			mainSocket?.emit("changeFriends");
		}
		mainSocket?.emit(events.BLOCK_USER, { userId: targetId });
	}

	function unblockUser() {
		mainSocket?.emit(events.UNBLOCK_USER, { userId: targetId });
	}

	function promoteUser() {
		chatSocket?.emit(events.PROMOTE_USER, { channelId: channel?.id, userId: targetId });
	}

	function demoteUser() {
		chatSocket?.emit(events.DEMOTE_USER, { channelId: channel?.id, userId: targetId });
	}

	function kickUser()
	{
		chatSocket?.emit(events.KICK_USER, { channelId: channel?.id, userId: targetId, userName });
	}

	function sendPrivmsg() {
		const channelName = targetId > currentUser.id ? targetId + '_' + currentUser.id : currentUser.id + '_' + targetId;
		const channelExists: Channel | undefined = channels.find((c) => c.channelName === channelName);

		if (!channelExists)
			chatCtx.ChatState.socket?.emit(events.NEW_PRIVMSG, { userId: targetId });
		chatCtx.ChatDispatch({ type: 'update_active', payload: channelExists });
	}

	async function toggleFriend(id: string, isInFriendList: boolean) {
		let toggleFunc: Function = isInFriendList ? removeFriend : addFriend;
		if (await toggleFunc(id) === true)
			mainSocket?.emit("changeFriends");
	}


	const clickable: string = 'hover:bg-indigo-600 cursor-pointer rounded text-white';
	const noneClickable: string = 'rounded text-gray-700';

	return (
		<ul
			className={`list-none w-48 rounded p-2 bg-zinc-800 fixed overflow-hidden z-[250]`}
			style={{ top: `${finalY}px`, left: `${finalX}px` }}
			ref={ref}
		>
			<li
				className={clickable}
				onClick={() => {
					goToProfile(userName);
				}}
			>
				Profile
			</li>
			{
				currentUser.id !== targetId &&
				<>
					{
						isInBlacklist || target.status === 'OFFLINE' && target.gameStatus === 'NONE' ?
							<li className={noneClickable}>
								Invite to play
							</li>
							:
							target.gameStatus === 'NONE' ?
								<li className={clickable} onClick={() => inviteToGame()}>Invite to play</li>
								: <></>
					}
					{
						isInBlacklist && target.gameStatus === 'INGAME' ?
							<li className={noneClickable}>
								Spectate game
							</li>
							:
							target.gameStatus === 'INGAME' ?
								<li className={clickable} onClick={() => spectateGame()}>Spectate game</li>
								: <></>
					}
					{
						isInBlacklist ?
							<li
								className={noneClickable}>
								Add Friend
							</li>
							:
							<li
								className={clickable}
								onClick={() => toggleFriend(targetId, isInFriendList)}
							>
								{isInFriendList ? 'Remove' : 'Add'} Friend
							</li>
					}
					{
						isInBlacklist ?
							<li className={noneClickable}>Direct Message</li>
							:
							<li
								className={clickable}
								onClick={sendPrivmsg}
							>
								Direct Message
							</li>
					}
					{
						isInBlacklist ?
							<li
								className={clickable}
								onClick={unblockUser}
							>
								Unblock
							</li>
							:
							<li
								className={clickable}
								onClick={() => { blockUser(targetId) }}
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
												className={clickable}
												onClick={demoteUser}
											>
												Demote
											</li>
											:
											<li
												className={clickable}
												onClick={promoteUser}
											>
												Promote
											</li>
									)
								}
								{
									isAdmin && !targetIsOwner &&
									<li className={clickable}
									onClick={kickUser}>
										Kick
									</li>
								}
								{
									isAdmin && !targetIsOwner &&
									<li className={clickable}
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
									<li className={clickable}
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
				</>
			}
		</ul >
	)
}
