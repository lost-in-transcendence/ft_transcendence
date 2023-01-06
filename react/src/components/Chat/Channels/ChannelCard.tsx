import { useContext, useEffect, useState } from "react";
import { FaLock as LockedIcon } from 'react-icons/fa'
import {AiFillEyeInvisible as EyeClosed, AiFillEye as EyeOpen } from 'react-icons/ai'

import ChatContext from "../Context/chatContext";
import * as events from '../../../../shared/constants'
import { Channel } from "../../../dto/channels.dto";
import Modal from "../../Modal/modal";

export function ChannelCard({ channel, joinable = true }: { channel: Channel, joinable?: boolean})
{
	const ctx = useContext(ChatContext);
	const socket = ctx.ChatState.socket;

	const [isOpen, setIsOpen] = useState(false)

	const isActive: boolean = ctx.ChatState.activeChannel?.id === channel.id;

	function joinChannel()
	{
		if (channel.mode === "PUBLIC")
		{
			const payload = { channelId: channel.id };
			socket?.emit(events.JOIN_CHANNEL, payload);
			ctx.ChatDispatch({ type: 'update_active', payload: channel })
		}
		else if (channel.mode === "PROTECTED")
		{
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
	if (channel.channelName.length > 13)
		formatedName = channel.channelName.slice(0, 13) + "...";

	return (
		<div className={`${isActive && 'bg-gray-500 rounded'} hover:bg-gray-500 hover:text-white text-left shadow`} >
			<span
				onClick={setActiveChannel}
				className={`${!joinable && 'cursor-pointer'} flex flex-row items-center mx-3 text-xl overflow-hidden break-words inline-flex`} >
				{
					channel.mode === 'PROTECTED' && joinable &&
					<LockedIcon className='mr-1'
					size={'17'} />
				}
				{formatedName}
			</span>
			{
				joinable &&
				<button
					onClick={joinChannel}
					className='rounded bg-gray-800 hover:bg-gray-700 absolute right-0 mt-[2px] mr-[2px]'>
					Join
					<Modal isOpen={isOpen} onClose={() => {setIsOpen(false)}}>
						<FormProtectedChannel onClose={() => {setIsOpen(false)}} channel={channel} />
					</Modal>
				</button>
			}
		</div>
	)
}

function FormProtectedChannel({ onClose, channel }: any)
{
	const context = useContext(ChatContext);

	const [data, setData] = useState("")
	const [passwordHidden, setPasswordHidden] = useState(true);
	const [unauthorized, setUnauthorized] = useState<'empty' | 'correct' | 'incorrect'>('empty')

	useEffect(() =>
	{
		context.ChatState.socket?.on("exception", (exception: any) => { setUnauthorized('incorrect');})
		return (() => { context.ChatState.socket?.off("exception") })
	}, [])

	function submitData(e: any)
	{
		e.preventDefault();
		context.ChatState.socket?.emit(events.JOIN_CHANNEL, { channelId: channel.id, password: data });
		setUnauthorized('correct');
	}

	return (
		<form
			onSubmit={submitData}
			className='flex flex-col'
		>
			<label className="flex flex-row justify-center gap-4 p-2">
				<p>Password</p>
				<div className="flex flex-col">
					<input
						className="basis-1/2 rounded shadow px-2"
						type={passwordHidden ? 'password' : 'text'}
						onChange={(e) => setData(e.target.value)} />
					{
						unauthorized === 'incorrect' &&
						<p className="text-red-600 self-center">Incorrect password</p>
					}
				</div>
				{
					passwordHidden ?
					<EyeOpen size={'20'} onClick={(e) => {e.stopPropagation(); setPasswordHidden(false)}} className='self-baseline relative -left-10 mt-0.5 text-gray-500 cursor-pointer' /> :
					<EyeClosed size={'20'} onClick={(e) => {e.stopPropagation(); setPasswordHidden(true)}} className='self-baseline relative -left-10 mt-0.5 text-gray-500 cursor-pointer' />
				}
			</label>
			<input
				type="submit"
				value='Join'
				className="bg-indigo-300 shadow  w-1/4 rounded self-center" />
		</form>
	)
}
