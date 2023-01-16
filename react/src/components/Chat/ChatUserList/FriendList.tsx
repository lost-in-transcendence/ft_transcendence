import { useContext, useEffect } from "react";
import { getUserMeModal } from "../../../requests";
import SocketContext from "../../Socket/socket-context";
import ContextMenuContext from "../ContextMenu/context-menu-context";
import { StatusUserList } from "./StatusUserList";

export function FriendList()
{
	const mainCtx = useContext(SocketContext);
	const {user} = mainCtx.SocketState;
	const {friends} = user;
	const onlineFriends = friends?.filter((v) => {return v.status !== "OFFLINE"});
	const offlineFriends = friends?.filter((v) => {return v.status === "OFFLINE"});

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
			<h1 className="text-5xl text-center">Friends</h1>
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
			}
		</>
	)
}