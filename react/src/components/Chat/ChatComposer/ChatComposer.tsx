import { useContext } from "react";
import ChatContext from "../Context/chatContext"
import * as events from "../../../../shared/constants"
import { Channel } from "../../../dto/channels.dto";
import { User } from "../../../dto/users.dto";
import { useState } from "react";

export function ChatComposer({channel, user}: {channel: Channel, user: User})
{
	const ctx = useContext(ChatContext);
	const socket = ctx.ChatState.socket;
	const [message, setMessage] = useState("");

	function sendText(e: any)
	{
		e.preventDefault()
		socket?.emit(events.MESSAGE, {userId: user.id, channelId: channel.id, message})
	}

	return (
		<input
			className="basis-1/2 rounded shadow px-2"
			placeholder="type your message"
			onChange={(e) => setMessage(e.target.value)}
			onSubmit={sendText}
		/>
	)
}