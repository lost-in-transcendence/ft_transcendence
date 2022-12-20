import { useContext } from "react";
import { FaLock as LockedIcon } from 'react-icons/fa'

import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { Channel } from "../../../dto/channels.dto";

export function ChannelCard({ channel, joinable = true }: { channel: Channel, joinable?: boolean })
{
	const ctx = useContext(ChatContext);
	const socket = ctx.ChatState.socket;
	const isActive: boolean = ctx.ChatState.activeChannel?.id === channel.id;

	function joinChannel()
	{
		const payload = { channelId: channel.id };
		console.log('in handleClick', { payload });
		socket?.emit(events.JOIN_CHANNEL, payload);
		ctx.ChatDispatch({ type: 'update_active', payload: channel })
	}

	function setActiveChannel()
	{
		if (joinable)
			return;
		ctx.ChatDispatch({ type: 'update_active', payload: channel });
	}

	let formatedName = channel.channelName;
	if (channel.channelName.length > 25)
		formatedName = channel.channelName.slice(0, 25) + "...";

	return (
		<div className={`${isActive && 'bg-gray-500 rounded'} hover:bg-gray-500 hover:text-white`} >
			<p
				onClick={setActiveChannel}
				style={{ flex: 4, textAlign: 'left', overflow: 'hidden' }}
				className={`${!joinable && 'cursor-pointer'} mx-3 text-sm`} >
				{formatedName}
				{
					channel.mode === 'PROTECTED' &&
					<LockedIcon size={'20'} />
				}
			</p>
			{
				joinable &&
				<button
					onClick={joinChannel}
					className='rounded bg-gray-800 hover:bg-gray-700'>
					Join
				</button>}
		</div>
	)
}
