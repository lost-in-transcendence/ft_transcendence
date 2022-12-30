import { FaUserFriends as FriendsIcon } from 'react-icons/fa'
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai'
import { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';

import { Accordeon } from "./Accordeon";
import ChatContext from "../Chat/Context/chatContext";
import { ChannelCard } from "../Chat/Channels/ChannelCard";
import Modal from '../Modal/modal';
import * as events from '../../../shared/constants/chat'

import '../Modal/modal.css'

export function ChatSidebar({ user }: any)
{
	const ctx = useContext(ChatContext);

	const privMsgs = ctx.ChatState.visibleChannels.filter((c) => c.mode === 'PRIVMSG');
	const joinedChans = ctx.ChatState.visibleChannels.filter((c) => (c.members?.find((m) => m.user.id === user.id)) && c.mode !== 'PRIVMSG')
	const visibleChans = ctx.ChatState.visibleChannels.filter((c) => !(c.members?.find((m) => m.user.id === user.id)) && c.mode !== 'PRIVMSG')

	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() =>
	{
		ctx.ChatState.socket?.emit(events.CHANNELS);
		setLoading(false);
	}, [])


	console.log('loggin visible chans', { visibleChans });

	function setFriends()
	{
		ctx.ChatDispatch({ type: 'update_active', payload: undefined });
	}

	if (loading)
		return (
			<div>Loading Channels</div>
		)

	return (
		<div className="basis-0 flex">
			<div className="bg-gray-700 w-full h-screen rounded drop-shadow-lg
						md:w-52
						text-gray-300 overflow-auto">
				<button className="flex flex-row gap-4 m-2 items-center h-12 w-11/12
							text-xl cursor-pointer rounded
							hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
							focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
					onClick={setFriends}
				>
					<FriendsIcon size='20' className="ml-3" />
					Friends
				</button>
				<button
					onClick={() => setIsOpen(true)}
					className="flex flex-row gap-4 m-2 items-center h-12 w-11/12
							text-xl cursor-pointer rounded
							hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
							focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm">
					<PlusIcon size='20' className='ml-3' />
					New
					<ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} >
						<CreateChannelForm onClose={() => { setIsOpen(false) }} />
					</ChatModal>
				</button>
				<hr className="border-gray-600 mb-2 w-11/12 m-auto" />
				{
					privMsgs.length > 0 &&
					<Accordeon title={'Private Messages'}>
						{
							privMsgs.map((c) => (
								<ChannelCard key={c.id} channel={c} joinable={false} />
							))
						}
					</Accordeon>
				}
				{
					joinedChans.length > 0 &&
					<Accordeon title={'Your channels'}>
						{
							joinedChans.map((c) => (
								<ChannelCard key={c.id} channel={c} joinable={false} />
							))
						}
					</Accordeon>
				}
				{
					visibleChans.length > 0 &&
					<Accordeon title={'Available channels'}>
						{
							visibleChans.map((c) => (
								<ChannelCard key={c.id} channel={c} />
							))
						}
					</Accordeon>
				}
			</div>
		</div>
	)
}

function ChatModal(props: { isOpen: boolean, children: any, onClose: any })
{
	const [displayChild, setDisplayChild] = useState(false);
	const socket = useContext(ChatContext).ChatState.socket;

	function closeModal()
	{
		socket?.emit(events.CHANNELS);
		setDisplayChild(false);
		props.onClose()
	}

	return ReactDOM.createPortal(

		<div className={`modal-overlay z-20 ${props.isOpen ? 'modal-open' : ''}`} onClick={(e) => { e.stopPropagation(); closeModal() }}>
			<div className="modal-content bg-gray-300 rounded" onClick={e => e.stopPropagation()}>
				<div className="modal-body">
					{
						props.isOpen &&
						props.children
					}
				</div>
				<button onClick={closeModal}>Close</button>
			</div>
		</div>,
		document.getElementById('root')!
	)
}

function CreateChannelForm({ onClose }: any)
{
	const [data, setData] = useState<{ channelName: string, mode: string, password?: string }>({ channelName: '', mode: 'PUBLIC' });
	const ctx = useContext(ChatContext);

	function createChannel(e: any)
	{
		e.preventDefault();
		ctx.ChatState.socket?.emit(events.CREATE_CHANNEL, data);
		ctx.ChatState.socket?.emit(events.CHANNELS)
		onClose();
	}

	return (
		<>
			<form
				className='flex flex-col'
				onSubmit={createChannel}
			>
				<label className='flex flex-row justify-between p-2'>
					<p>Channel Name</p>
					<input
						type={'text'}
						onChange={(e) => setData({ ...data, channelName: e.target.value })}
						className='basis-1/2 rounded shadow'
					/>
				</label>
				<label className='flex flex-row justify-between p-2'>
					<p>Mode</p>
					<select
						className='basis-1/2 rounded shadow'
						name='mode' defaultValue={'PUBLIC'}
						onChange={(e) => setData({ channelName: data.channelName, mode: e.target.value })}
					>
						<option value={'PUBLIC'}>Public</option>
						<option value={'PRIVATE'} >Private</option>
						<option value={'PROTECTED'}>Password protected</option>
					</select>
				</label>
				{
					data.mode === 'PROTECTED' &&
					<label className='flex flex-row justify-between p-2'>
						<p>Password</p>
						<input
							type={'text'}
							onChange={(e) => setData({ ...data, password: e.target.value })}
							className='basis-1/2 rounded shadow'
						/>
					</label>
				}
				<input
					type={'submit'}
					name='Submit'
					className='bg-indigo-300 shadow border w-1/4 rounded self-center'
				/>
			</form>
		</>
	)
}
