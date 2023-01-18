
import { ReactNode, useContext } from "react";
import { SharedOtherUserDto } from "../../../../shared/dtos";
import SocketContext from "../../Socket/socket-context";
import ChatContext from "../Context/chatContext";
import ContextMenuContext from "../ContextMenu/context-menu-context";
import * as events from '../../../../shared/constants'
import { UserAvatarStatus } from "../../Avatar/UserAvatarStatus";
import { ImUserCheck } from "react-icons/im"


export function StatusBlockedList({userList, children}: {userList: SharedOtherUserDto[], children: ReactNode})
{
	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;
	const mainCtx = useContext(SocketContext);
	const mainSocket = mainCtx.SocketState.socket;

	function unblockUser(targetId: string) {
		mainSocket?.emit(events.UNBLOCK_USER, { userId: targetId });
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
						}}>
						<div className="group h-[50px] flex gap-4 items-center hover:bg-gray-700 pl-2 cursor-pointer">
							<UserAvatarStatus userName={v.userName} status={v.status} border={"border-gray-800"} size={"10"} className={"mx-0 my-0"} />
							<div className="">
								<p className="break-keep">{v.userName.length > 15? v.userName.slice(0, 12) + "..." : v.userName}</p>
								<p>{status}</p>
							</div>
							<div className="ml-auto mr-5 w-[30px] h-[30px] bg-gray-700 group/button group-hover:bg-gray-900 rounded-full flex items-center">
								<ImUserCheck size={17} className="mx-auto my-auto text-gray-400 group-hover/button:text-gray-300" 						
								onClick={(e) =>
								{
									e.preventDefault();
									unblockUser(v.id);
								}}/>
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