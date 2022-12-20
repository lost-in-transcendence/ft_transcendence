import { useContext, useEffect, useState } from "react";
import { FaLock as LockedIcon } from 'react-icons/fa'

import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { Channel } from "../../../dto/channels.dto";
import Modal from "../../Modal/modal";
import { Socket } from "socket.io-client";

export function ChannelCard({ channel, joinable = true }: { channel: Channel, joinable?: boolean })
{
	const ctx = useContext(ChatContext);
	const socket = ctx.ChatState.socket;
	const isActive: boolean = ctx.ChatState.activeChannel?.id === channel.id;
	const [isOpen, setIsOpen] = useState(false)

	function joinChannel()
	{
		if (channel.mode === "PUBLIC")
		{
			const payload = { channelId: channel.id };
			console.log('in handleClick', { payload });
			socket?.emit(events.JOIN_CHANNEL, payload);
			ctx.ChatDispatch({ type: 'update_active', payload: channel })
		}
		else if (channel.mode === "PROTECTED")
		{
			console.log('in protected join button')
			setIsOpen(true);
		}
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
					<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
						<FormProtectedChannel onClose={() => {console.log('in from onClose');setIsOpen(false)}} channel={channel}/>
					</Modal>
				</button>}
		</div>
	)
}

function FormProtectedChannel({onClose, channel}: any)
{
	const [data, setData] = useState("")
	const context = useContext(ChatContext);
	const [unauthorized, setUnauthorized] = useState<'empty' | 'correct' | 'incorrect'>('empty')

	useEffect(() => {
		context.ChatState.socket?.on("exception", (exception: any) => {setUnauthorized('incorrect'); console.log("INSIDE EXCEPTION UNAUTHORIZED")})
		return (() => {context.ChatState.socket?.off("exception")})
	}, [])

	useEffect(() =>
	{
		if (unauthorized === 'correct')
			onClose();
	}, []);

	function	submitData(e: any)
	{
		e.preventDefault();
		context.ChatState.socket?.emit(events.JOIN_CHANNEL, {channelId: channel.id, password: data});
		setUnauthorized('correct');
	}

	return (
		<form onSubmit={submitData}>
			<label className="flex">
				password:
				<input
					type="password"
					onChange={(e) => setData(e.target.value)}/>
				{unauthorized === 'incorrect' && <p className="text-red-600">incorrect password</p>}
			</label>
			<input
			type="submit"
			/>
		</form>
	)
}
