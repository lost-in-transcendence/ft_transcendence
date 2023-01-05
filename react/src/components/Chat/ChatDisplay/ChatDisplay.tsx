import { useContext, useEffect, useState } from "react";

import { User } from "../../../dto/users.dto";
import { ChatComposer } from "../ChatComposer/ChatComposer";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { backURL } from "../../../requests";
import { useNavigate } from "react-router-dom";
import { ChatRightBar } from "../rightBar/ChatRightBar";

export function ChatDisplay({ user }: { user: User }) {
	const ctx = useContext(ChatContext);
	const channel = ctx.ChatState.activeChannel;
	const socket = ctx.ChatState.socket;

	const [users, setUsers] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		console.log('in chatDisplay useEffect');
		socket?.on(events.USERS, (payload: any) => {
			console.log({ payload });
			setUsers(payload);
		})

		socket?.emit(events.USERS, { channelId: channel?.id });
		return (() => {
			socket?.off(events.USERS);
		})
	}, [channel])

	return (
		<div className="flex flex-row bg-slate-500 h-screen">
			<div className="flex flex-col basis-full overflow-x-hidden">
				<ChatWindow users={users} className="bg-slate-400 basis-full overflow-y-auto px-1 py-2" />
				<ChatComposer className="justify-self-end"
					user={user} />
				<div className='flex justify-self-end'>
					<ChatRightBar users={users} className='flex justify-self-end' />
				</div>
			</div>
		</div>
	)
}
