import { useContext } from "react";
import { SharedChannelDto } from "../../../../shared/dtos";
import { ChatChannelDto, ChatContext } from "../Context/chatContext";
import { ChannelCard } from "./ChannelCard";

export function ChannelList({channels}: {channels: ChatChannelDto[]})
{
	const {user, visibleChans} = useContext(ChatContext);

	console.log({visibleChans});
	const joinedChannels = visibleChans.filter((c) => c.members.find((m) => m.user.id === user.id))
	const otherChannels = visibleChans.filter((c) => c.members.find((m) => m.user.id !== user.id))
	console.log({joinedChannels}, {otherChannels});
	return (
		<div className="channelList" style={{ width: '15%', overflow: "auto", height: '100%', boxShadow: '0.1rem 0.1rem 10px rgba(0, 0, 0, 0.3)'}} >
			{
				channels.map((c) =>
				{
					return <ChannelCard key={c.id} name={c.channelName} mode={c.mode} />
				})
			}
		</div>
	)
}
