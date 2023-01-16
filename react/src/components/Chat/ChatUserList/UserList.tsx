import { useContext, useEffect, useState } from "react";
import { SharedOtherUserDto, SharedPartialUserDto } from "../../../../shared/dtos";
import { getUserMeModal } from "../../../requests";
import SocketContext from "../../Socket/socket-context";
import ContextMenuContext from "../ContextMenu/context-menu-context";
import { StatusUserList } from "./StatusUserList";
import * as events from "../../../../shared/constants";

export function UserList()
{
	const mainCtx = useContext(SocketContext);
	const mainSocket = mainCtx.SocketState.socket;
	const blackList = useContext(SocketContext).SocketState.user.blacklist;

	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;
	const currentUser = mainCtx.SocketState.user;	

	const [users, setUsers] = useState<SharedOtherUserDto[]>([]);

	const onlineUser: SharedOtherUserDto[] = users.filter((u) => u.status === 'ONLINE' && u.id !== currentUser.id)
	const offlineUser: SharedOtherUserDto[] = users.filter((u) => u.status === 'OFFLINE' && u.id !== currentUser.id)

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

	useEffect(() => {
		mainSocket?.on(events.GET_ALL_USERS, (payload: SharedOtherUserDto[]) => {
			setUsers(payload)
		})
		mainSocket?.emit(events.GET_ALL_USERS);
		return () => {
			mainSocket?.off(events.GET_ALL_USERS)
		}
	}, [])

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
		<h1 className="text-5xl text-center">Users</h1>
		{
			onlineUser && onlineUser.length > 0 ?
			<StatusUserList userList={onlineUser}>
				<p className="text-lg ml-[5px]">Online</p>
				<hr className="bg-gray-700 border-0 h-[1px]"/>
			</StatusUserList>
			: null
		}
		{
			offlineUser && offlineUser.length > 0 ?
			<StatusUserList userList={offlineUser}>
				<p className="text-lg ml-[5px]">Offline</p>
				<hr className="bg-gray-700 border-0 h-[1px]"/>
			</StatusUserList>
			: null
		}
			{/* <h1 className="text-5xl text-center">Friends</h1>
			{
			onlineFriends && onlineFriends.length > 0 ?
			<>
			<StatusUserList userList={onlineFriends}>	
				<p className="text-lg ml-[5px]">Online</p>
				<hr className="bg-gray-700 border-0 h-[1px]"/>
			</StatusUserList>
			</>
			:
			<> </>
			}
			{
			offlineFriends && offlineFriends.length > 0 ?
			<>
			<StatusUserList userList={offlineFriends}>	
				<p className="text-lg ml-[5px]">Offline</p>
				<hr className="bg-gray-700 border-0 h-[1px]"/>
			</StatusUserList>
			</>
			:
			<> </>
			} */}
		</>
	)
}