import { FriendList } from "./FriendList";
import { FaUserAlt, FaUserFriends, FaUserSlash } from "react-icons/fa";
import { Selection } from "../../../components/commons/Selection";
import { useState } from "react";
import { UserList } from "./UserList";
import { BlockedList } from "./BlockedList";

export function ChatUserList()
{
	const [status, setStatus] = useState('friendList');

	return (
		<>
		<div className="flex mb-[20px]">
			<Selection onClick={() => { setStatus('friendList'); }} isActive={status === 'friendList'}>
				<FaUserFriends size="30" className="ml-3" /><span className="text-2xl">Friends</span>
			</Selection>
			<Selection onClick={() => {setStatus('userList')}} isActive={status === 'userList'}>
				<FaUserAlt size="30" className="ml-3"/><span className="text-2xl">Users</span>
			</Selection>
			<Selection onClick={() => {setStatus('blockedList')}} isActive={status === 'blockedList'}>
				<FaUserSlash size="30" className="ml-3" /><span className="text-2xl">Blocked</span>
			</Selection>
		</div>
		{status === 'friendList' ? <FriendList /> : null }
		{status === 'userList' ? <UserList /> : null}
		{status === 'blockedList' ? <BlockedList /> : null}
		</>
	)
}


