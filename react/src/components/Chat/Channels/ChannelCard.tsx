import { useContext } from "react";

import { ChatContext } from "../Context/chatContext";
import * as events from '../../../../shared/constants'

export function ChannelCard({name, mode, id, joinable = true}: {name: string, mode: string, id: string, joinable?: boolean})
{
	const {socket} = useContext(ChatContext);

	function handleClick()
	{
		console.log('in handleClick');
		const payload = {channelId: id};
		socket?.emit(events.JOIN_CHANNEL, payload);
		socket?.emit(events.JOINED_CHANNELS);
		socket?.emit(events.JOINABLE_CHANNELS);
	}

	let formatedName = name;
	if (name.length > 25)
		formatedName = name.slice(0, 25) + "...";

	return (
		<div className="channelCard" style={
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
			<p style={{fontSize: '2rem', flex: 4, textAlign: 'left', overflow: 'hidden'}} >{formatedName}</p>
			{
				joinable &&
				<button onClick={handleClick} style={{ width: '10%', fontSize: '1rem', flex: 0.5, justifySelf: 'flex-end'}}>
					Join
				</button>}
		</div>
		// <div>
		// 	DIV
		// </div>
	)
}