import { useContext, useState } from "react";
import { SharedChannelDto } from "../../../../shared/dtos";
import { Channel } from "../../../dto/channels.dto";
import SocketContext from "../../Socket/socket-context";
import ChatContext, { ChatChannelDto} from "../Context/chatContext";
import { ChannelCard } from "./ChannelCard";

export function ChannelList()
{
	const user = useContext(SocketContext).SocketState.user;
	const visibleChannels = useContext(ChatContext).ChatState.visibleChannels;
	const ChatDispatch = useContext(ChatContext).ChatDispatch;
	let joined : Channel []= [];
	let joinable : Channel[] = [];
	for (let channel of visibleChannels)
	{
		channel.members?.find((m) => m.user.id === user.id) ? joined.push(channel) : joinable.push(channel);
	}

	return (
		<div className="channelList" style={{ width: '15%', overflow: "auto", height: '100%', boxShadow: '0.1rem 0.1rem 10px rgba(0, 0, 0, 0.3)' }} >
			<h1>Joined</h1>
			{
				joined.map((c) =>
				{
					return (
						<ChannelCard onClick={() => ChatDispatch({type: "update_active", payload: c})} key={c.id} name={c.channelName} mode={c.mode} id={c.id} joinable={false} />
					)
				})
			}
			<h1>Avalaible</h1>
			{
				joinable.map((c) =>
				{
					return (
						<ChannelCard onClick={()=>{}} key={c.id} name={c.channelName} mode={c.mode} id={c.id} />
					)
				})
			}
		</div>
	)
}
