import { useContext, useEffect, useState} from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { getUserMeModal } from "../requests";
import ChatContext from '../components/Chat/Context/chatContext'
import { ChatSidebar } from "../components/Menu/ChatSideBar";
import { ChatDisplay } from "../components/Chat/ChatDisplay/ChatDisplay";
import SocketContext from "../components/Socket/socket-context";
import { UserAvatarStatus } from "../components/Avatar/UserAvatarStatus";
import { BsFillChatFill } from "react-icons/bs";
import { SharedOtherUserDto } from "../../shared/dtos";
import { ContextMenuData } from "../components/Chat/dto";
import { ContextMenu } from "../components/Chat/rightBar/ContextMenu";
import * as events from '../../../shared/constants'
import { Channel } from "../dto/channels.dto";
import { PartialOtherUser } from "../dto/users.dto";


export async function loader()
{
	const res = await getUserMeModal(new URLSearchParams({ 'channels': 'true' }));
	if (res.status !== 200)
	{
		return redirect('/login');
	}
	const user = await res.json();
	return ({ user });
}

export function Chat()
{
	const ctx = useContext(ChatContext);
	const state = ctx.ChatState;
	const data: any = useLoaderData();
	const { user } = data;
	const [displayContext, setDisplayContext] = useState<ContextMenuData | undefined>(undefined);

	return (
		<div className="flex flex-col md:flex-row">
			<ChatSidebar user={user} />
			<div className="text-white basis-full overflow-auto justify-self-center mr-auto bg-gray-800">
				{
					state.activeChannel ?
						<ChatDisplay currentUser={user} setDisplayContext={setDisplayContext}/>
						:
						<>
							<h1 className="text-5xl text-center">Friends</h1>
							<ChatFriendList setDisplayContext={setDisplayContext}/>
						</>
				}
			</div>
			{displayContext && (
        	<ContextMenu
          		x={displayContext.x}
          		y={displayContext.y}
         		userName={displayContext.userName}
          		targetId={displayContext.targetId}
        	/>
      		)}
		</div>
	)
}

export function ChatFriendList({setDisplayContext} : {setDisplayContext: React.Dispatch<React.SetStateAction<ContextMenuData | undefined>> })
{
	const mainCtx = useContext(SocketContext);
	const {user} = mainCtx.SocketState;
	const {friends} = user;
	const onlineFriends = friends?.filter((v) => {return v.status !== "OFFLINE"});
	const offlineFriends = friends?.filter((v) => {return v.status === "OFFLINE"});
	// const {displayContext, setDisplayContext} = contextMenu
	const chatCtx = useContext(ChatContext);
	const channels = chatCtx.ChatState.visibleChannels;

	useEffect(() =>
	{
		const handleClick = () => setDisplayContext(undefined);
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
							<>
							<li key={v.id}
							onContextMenu={(e) =>
								{
									e.preventDefault();
									setDisplayContext({
										x: e.pageX,
										y: e.pageY,
										userName: v.userName,
										targetId: v.id
									});
								}}
							onClick={(e) =>
							{
								e.preventDefault();
								sendPrivmsg(v.id);
							}}>
								<div className="group h-[50px] flex gap-4 items-center hover:bg-gray-700 pl-2 cursor-pointer"
								onClick={() => console.log("this should open privmsg chat with", v.userName)}>
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
							</li>
							<hr className="bg-gray-700 border-0 h-[1px]" />
							</>

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
					offlineFriends?.map((v) =>
					{
						if (v.status !== "OFFLINE")
							return;
						let status: string = v.status.toLocaleLowerCase();
						status = status.charAt(0).toLocaleUpperCase() + status.slice(1);
						return (
							<>
							<li key={v.id}
							onContextMenu={(e) =>
								{
									e.preventDefault();
									setDisplayContext({
										x: e.pageX,
										y: e.pageY,
										userName: v.userName,
										targetId: v.id
									});
								}}
								onClick={(e) =>
								{
									e.preventDefault();
									sendPrivmsg(v.id);
								}}>
								<div className="group h-[50px] flex gap-4 items-center hover:bg-gray-700 pl-2 cursor-pointer"
								onClick={() => console.log("this should open privmsg chat with", v.userName)}>
									<UserAvatarStatus userName={v.userName} status={v.status} border={"border-gray-800"} size={"10"} className={"mx-0 my-0"} />
									<div className="w-[80px]">
										<p>{v.userName}</p>
										<p>{status}</p>
									</div>
									<div className="ml-auto mr-5 w-[30px] h-[30px] bg-gray-700 group/button group-hover:bg-gray-900 rounded-full flex items-center">
										<BsFillChatFill size={17} className="mx-auto my-auto text-gray-400 group-hover/button:text-gray-300" />
									</div>
									{/* <div className="w-[30px] h-[30px] bg-gray-700 group/button group-hover:bg-gray-900 rounded-full flex items-center">
										<SlOptionsVertical size={17} className="mx-auto my-auto text-gray-400 group-hover/button:text-gray-300" />
									</div> */}
								</div>
							</li>
							<hr className="bg-gray-700 border-0 h-[1px]" />
							</>

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