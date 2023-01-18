import { ReactNode, useContext } from "react";
import { SharedOtherUserDto } from "../../../../shared/dtos";
import { Channel } from "../../../dto/channels.dto";
import SocketContext from "../../Socket/socket-context";
import ChatContext from "../Context/chatContext";
import ContextMenuContext from "../ContextMenu/context-menu-context";
import * as events from '../../../../shared/constants'
import { UserAvatarStatus } from "../../Avatar/UserAvatarStatus";
import { BsFillChatFill } from "react-icons/bs";


export function StatusUserList({userList, children}: {userList: SharedOtherUserDto[], children: ReactNode})
{
	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;
	const mainCtx = useContext(SocketContext);
	const {user} = mainCtx.SocketState;
	const chatCtx = useContext(ChatContext);
	const channels = chatCtx.ChatState.visibleChannels;

	function sendPrivmsg(targetId: string, )
	{
		const channelName = targetId > user.id ? targetId + '_' + user.id : user.id + '_' + targetId;
		const channelExists: Channel | undefined = channels.find((c: any) => c.channelName === channelName);

		if (!channelExists)
			chatCtx.ChatState.socket?.emit(events.NEW_PRIVMSG, {userId: targetId});
		else
			chatCtx.ChatDispatch({type: 'update_active', payload: channelExists});
	}
	return (
		<> 
			{children}
			<ul>
			{
			userList?.map((v, i) =>
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
							<div className="">
								<p className="break-keep">{v.userName.length > 15? v.userName.slice(0, 12) + "..." : v.userName}</p>
								<p>{status}</p>
							</div>
							{
								v.gameStatus !== 'NONE' ?
								<div>
									<p>Currently</p>
									<p>{v.gameStatus === 'WAITING' ? 'In Queue' : "In Game"}</p>
								</div>
								: null
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
	)
}