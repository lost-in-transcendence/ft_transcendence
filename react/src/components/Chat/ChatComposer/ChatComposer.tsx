import { useContext } from "react";
import ChatContext from "../Context/chatContext"
import * as events from "../../../../shared/constants"
import { Channel } from "../../../dto/channels.dto";
import { User } from "../../../dto/users.dto";
import { useState } from "react";

export function ChatComposer({ user, className }: { user: User, className?: string })
{
	const ctx = useContext(ChatContext);
	const channel = ctx.ChatState.activeChannel;
	const socket = ctx.ChatState.socket;
	const [message, setMessage] = useState("");

	function sendText(e: any)
	{
		e.preventDefault()
		console.log("input sent")
		socket?.emit(events.TO_CHANNEL, { channelId: channel?.id, content: message })
		setMessage("")
	}

	return (
		<div className={className}>
			<form
				onSubmit={sendText}>
			<input
				className="basis-1/2 rounded shadow px-2 text-black w-full h-10 "
				placeholder="type your message"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			</form>
		</div>
	)
}
