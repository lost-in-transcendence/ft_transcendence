import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { backURL, getUserMe, getUserMeModal } from "../requests";
import io, {Socket}from 'socket.io-client'

export async function loader()
{
<<<<<<< HEAD
	const res = await getUserMe();
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
=======
	const res = await getUserMeModal(new URLSearchParams({'friends': 'true'}));
	return res;
>>>>>>> dev
}

export function Chat()
{
<<<<<<< HEAD
	const data: any = useLoaderData();
	const {user, socket} = data;
	const [channelList, setChannelList] = useState<any[]>([]);

	async function onChannel(packet : string)
	{
		const body = await JSON.parse(packet);
		console.log(body);
		setChannelList(body);
	}

	useEffect(() =>
	{
		socket.connect();
		socket.on('channels', onChannel);
		return () =>
		{
			socket?.off('channels');
			socket?.disconnect();
		};
	}, [])
	// console.log({user});
=======
	const user: any = useLoaderData();
>>>>>>> dev
	const auth = useContext(AuthContext);
	return (
		<div>
			<h1>Chat</h1>
			<button onClick={() => {socket.emit('channels', {}); console.log(socket.id)}}>Channels</button>
			<ul style={{textDecoration: 'none'}}>
				{
					channelList.map((c) =>
					{
						return (
							<li key={c.id}>{c.channelName} {c.mode}</li>
						)
					})
				}
			</ul>
		</div>
	)
}
