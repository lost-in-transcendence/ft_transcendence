import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import io, {Socket}from 'socket.io-client'

import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { backURL, getUserMe, getUserMeModal } from "../requests";
import { ChannelList } from "../components/Chat/Channels/ChannelList";
import { ChatChannelDto, ChatContext } from '../components/Chat/Context/chatContext'

export async function loader()
{
const res = await getUserMeModal(new URLSearchParams({'friends': 'true'}));
if (res.status !== 200)
{
	return redirect('/login');
}
// const newSocket = io(`http://localhost:3333`, {/*path: '/chat',*/ autoConnect: false, /*extraHeaders: {"Authorization": "Bearer " + getCookie('jwt')}, withCredentials: true*//*, transports: ['websocket']*//*, transportOptions: {polling: {extraHeaders: {"Authorization": "Bearer " + getCookie('jwt')}}}*/});
// console.log({newSocket});
const newSocket = io('http://localhost:3333/chat',
{
	autoConnect: false,
	auth: {token: getCookie('jwt')},
	extraHeaders: {'Authorization' : 'Bearer ' + getCookie('jwt')}
});
return {user: res, socket: newSocket};
}

export function Chat()
{
	const ctx = useContext(ChatContext)
	const data: any = useLoaderData();
	const {user, socket} = data;
	const [channelList, setChannelList] = useState<ChatChannelDto[]>([]);

	function onChannel(packet : ChatChannelDto[])
	{
		if (!packet) return;
		setChannelList(packet);
	}

	useEffect(() =>
	{
		console.debug('In Chat component useEffect');

		socket.connect();

		socket.on('channels', onChannel);

		socket.emit('channels');

		return () =>
		{
			console.debug('In useEffect cleanup');
			socket?.off('channels');
			socket?.disconnect();
		};
	}, [])
	// console.log({user});
	return (
		<ChatContext.Provider value={{user: user, visibleChans: channelList}}>
			<div style={{height: 'inherit', border: '1px solid blue', display: 'flex', flexDirection: 'column', margin: '0'}}>
				<h1 style={{height: '10%', border: '1px solid orange'}}>Chat</h1>
				<div style={{height: '90%', border: '1px solid red', margin: '0'}}>
					<ChannelList channels={channelList} />
				</div>
				{/* <button onClick={() => {socket.emit('channels'); console.log(socket.id)}}>Channels</button> */}
			</div>
		</ChatContext.Provider>
	)
}
