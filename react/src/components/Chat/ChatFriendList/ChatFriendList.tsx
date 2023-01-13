import { useContext, useEffect } from "react";
import { BsFillChatFill } from "react-icons/bs";
import { Channel } from "../../../dto/channels.dto";
import { getUserMeModal } from "../../../requests";
import { UserAvatarStatus } from "../../Avatar/UserAvatarStatus";
import SocketContext from "../../Socket/socket-context";
import ChatContext from "../Context/chatContext";
import ContextMenuContext from "../ContextMenu/context-menu-context";
import * as events from '../../../../shared/constants'

export function ChatFriendList()
{
	const mainCtx = useContext(SocketContext);
	const {user} = mainCtx.SocketState;
	const {friends} = user;
	const onlineFriends = friends?.filter((v) => {return v.status !== "OFFLINE"});
	const offlineFriends = friends?.filter((v) => {return v.status === "OFFLINE"});

	const chatCtx = useContext(ChatContext);
	const channels = chatCtx.ChatState.visibleChannels;

	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;

	useEffect(() =>
	{
		const handleClick = () => setContextMenu(undefined);
		window.addEventListener("click", handleClick);
		return () =>
		{
			window.removeEventListener("click", handleClick);
		};
	}, []);

	function sendPrivmsg(targetId: string, )
	{
		const channelName = targetId > user.id ? targetId + '_' + user.id : user.id + '_' + targetId;
		const channelExists: Channel | undefined = channels.find((c: any) => c.channelName === channelName);

		if (!channelExists)
			chatCtx.ChatState.socket?.emit(events.NEW_PRIVMSG, {userId: targetId});
		else
			chatCtx.ChatDispatch({type: 'update_active', payload: channelExists});
	}

	useEffect(() =>
	{	
		async function setFriendsOnLoad()
		{
			const res = await getUserMeModal(new URLSearchParams({friends: 'true'}))
			const json = await res.json();
			const friends = json.friends;
			mainCtx.SocketDispatch({type: 'update_user', payload: friends});
		}
		setFriendsOnLoad();
	}, [])

	return (
		<>
			{ onlineFriends && onlineFriends.length > 0 ?
			<>
			<p className="ml-1">Online</p>
			<hr className="bg-gray-700 border-0 h-[1px]"/>
			<ul>
					{onlineFriends?.map((v) =>
					{
						let status: string = v.status.toLocaleLowerCase();
						status = status.charAt(0).toLocaleUpperCase() + status.slice(1);
						return (
							<li key={v.id}
							onContextMenu={(e) =>
							{
								e.preventDefault();
								setContextMenu({
									x: e.pageX,
									y: e.pageY,
									channel: undefined,
									target: v
								});
							}}
							onClick={(e) =>
							{
								e.preventDefault();
								sendPrivmsg(v.id);
							}}>
								<div className="group h-[50px] flex gap-4 items-center hover:bg-gray-700 pl-2 cursor-pointer">
									<UserAvatarStatus userName={v.userName} status={v.status} border={"border-gray-800"} size={"10"} className={"mx-0 my-0"} />
									<div className="w-[80px]">
										<p>{v.userName}</p>
										<p>{status}</p>
									</div>
									{
										v.gameStatus !== "NONE" ?
										<div>
											<p>Currently</p>
											<p>{v.gameStatus === "INGAME" ? "In Game" : "In Queue"}</p>
										</div>
										:
										<></>

									}
									<div className="ml-auto mr-5 w-[30px] h-[30px] bg-gray-700 group/button group-hover:bg-gray-900 rounded-full flex items-center">
										<BsFillChatFill size={17} className="mx-auto my-auto text-gray-400 group-hover/button:text-gray-300" />
									</div>
								</div>
								<hr className="bg-gray-700 border-0 h-[1px]" />
							</li>

						)
					})
					}
				</ul>
			</>
			:
			<> </>
			}
			{
				offlineFriends && offlineFriends.length > 0 ?
				<> 
				<p>Offline</p>
				<hr className="bg-gray-700 border-0 h-[1px]"/>
			<ul>
				{
					offlineFriends?.map((v, i) =>
					{
						let status: string = v.status.toLocaleLowerCase();
						status = status.charAt(0).toLocaleUpperCase() + status.slice(1);
						return (
						
							<li key={i}
							onContextMenu={(e) =>
								{
									e.preventDefault();
									setContextMenu({
										x: e.pageX,
										y: e.pageY,
										channel: undefined,
										target: v
									});
								}}
								onClick={(e) =>
								{
									e.preventDefault();
									sendPrivmsg(v.id);
								}}>
								<div className="group h-[50px] flex gap-4 items-center hover:bg-gray-700 pl-2 cursor-pointer">
									<UserAvatarStatus userName={v.userName} status={v.status} border={"border-gray-800"} size={"10"} className={"mx-0 my-0"} />
									<div className="w-[80px]">
										<p>{v.userName}</p>
										<p>{status}</p>
									</div>
									<div className="ml-auto mr-5 w-[30px] h-[30px] bg-gray-700 group/button group-hover:bg-gray-900 rounded-full flex items-center">
										<BsFillChatFill size={17} className="mx-auto my-auto text-gray-400 group-hover/button:text-gray-300" />
									</div>
								</div>
								<hr className="bg-gray-700 border-0 h-[1px]" />
							</li>
						)
					})
				}
				</ul>
			</>
			:
			<> </>
			}
		</>
	)
}
