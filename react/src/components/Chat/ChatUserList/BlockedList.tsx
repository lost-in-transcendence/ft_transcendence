import { useContext, useEffect, useState } from "react";
import { SharedOtherUserDto, SharedPartialUserDto } from "../../../../shared/dtos";
import { getUserMeModal } from "../../../requests";
import SocketContext from "../../Socket/socket-context";
import ContextMenuContext from "../ContextMenu/context-menu-context";
import { StatusUserList } from "./StatusUserList";
import * as events from "../../../../shared/constants";

export function BlockedList()
{
	const mainCtx = useContext(SocketContext);
	const mainSocket = mainCtx.SocketState.socket;
	const blackList: SharedOtherUserDto[] | undefined = useContext(SocketContext).SocketState.user.blacklist;

	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;
	const currentUser = mainCtx.SocketState.user;	

//	const [users, setUsers] = useState<SharedOtherUserDto[]>([]);

//	const onlineUser: SharedPartialOtherUserDto[] = users.filter()
	useEffect(() =>
	{
		const handleClick = () => setContextMenu(undefined);
		window.addEventListener("click", handleClick);
		return () =>
		{
			window.removeEventListener("click", handleClick);
		};
	}, []);

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
		<h1 className="text-5xl text-center">Blocked</h1>
		{ blackList && blackList.length > 0 ?
		<StatusUserList userList={blackList}>
				<hr className="bg-gray-700 border-0 h-[1px]"/>
		</StatusUserList>
		:
		<h1>You haven't blocked any users</h1>
		}
		</>
	)
}