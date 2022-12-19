import { useContext } from "react";

import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { Channel } from "../../../dto/channels.dto";

export function ChannelCard({channel, joinable = true}: {channel: Channel, joinable?: boolean})
{
	const ctx = useContext(ChatContext);
	const socket = ctx.ChatState.socket;

	function handleClick()
	{
		const payload = {channelId: channel.id};
		console.log('in handleClick', {payload});
		socket?.emit(events.JOIN_CHANNEL, payload);
	}

	let formatedName = channel.channelName;
	if (channel.channelName.length > 25)
		formatedName = channel.channelName.slice(0, 25) + "...";

	return (
		<div  className="channelCard" style={
			{
				boxShadow: '0.1rem 0.1rem 10px rgba(0, 0, 0, 0.3)',
				width: '98%',
				height: '4rem',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				// justifyContent: 'space-between',
				padding: 'auto',
				margin: '0%',
				direction: 'revert',
			}
		} >
			<p
			onClick={() => {console.log('clicking on div'); ctx.ChatDispatch({type: 'update_active', payload: channel})}}
			style={{flex: 4, textAlign: 'left', overflow: 'hidden'}}
			className='cursor-pointer mx-3 text-sm' >{formatedName} - {channel.mode}</p>
			{
				joinable &&
				<button
				onClick={handleClick}
				className='rounded bg-gray-800 hover:bg-gray-700'
				style={{ width: '10%', fontSize: '1rem', flex: 0.5, justifySelf: 'flex-end'}}>
					Join
				</button>}
		</div>
		// <div>
		// 	DIV
		// </div>
	)
}
