import { Channel } from "../../../dto/channels.dto";

export function MemberList({channel}: {channel: Channel})
{
	return(
		<div>
			<h1>{channel.channelName}</h1>
			{
				channel.members?.map((m) =>
				{
					return (
						<p key={m.user.id}>{m.user.userName}</p>
					)
				})
			}
		</div>
	)
}
