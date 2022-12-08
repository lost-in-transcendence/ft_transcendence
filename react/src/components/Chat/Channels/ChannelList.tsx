import { useContext } from "react";
import { SharedChannelDto } from "../../../../shared/dtos";
import { ChatChannelDto, ChatContext } from "../Context/chatContext";
import { ChannelCard } from "./ChannelCard";

export function ChannelList()
{
	const { joined, joinable, visible, socket } = useContext(ChatContext);

	return (
		<div className="channelList" style={{ width: '15%', overflow: "auto", height: '100%', boxShadow: '0.1rem 0.1rem 10px rgba(0, 0, 0, 0.3)' }} >
			<h1>Joined</h1>
			{
				joined.map((c) =>
				{
					return (
						<ChannelCard key={c.id} name={c.channelName} mode={c.mode} id={c.id} joinable={false} />
					)
				})
			}
			<h1>Avalaible</h1>
			{
				joinable.map((c) =>
				{
					return (
						<ChannelCard key={c.id} name={c.channelName} mode={c.mode} id={c.id} />
					)
				})
			}
			<h1>Visible</h1>
			{
				visible.map((c) =>
				{
					return (
						<ChannelCard key={c.id} name={c.channelName} mode={c.mode} id={c.id} />
					)
				})
			}
		</div>
	)
}
