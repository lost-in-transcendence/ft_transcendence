import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import io, { Socket } from 'socket.io-client'
import { FaUserFriends } from 'react-icons/fa'

import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { backURL, getUserMe, getUserMeModal } from "../requests";
import { ChannelList } from "../components/Chat/Channels/ChannelList";
import ChatContext, { ChatChannelDto } from '../components/Chat/Context/chatContext'
import { useSocket } from "../hooks/use-socket";
import { ChatContextComponent } from "../components/Chat/Context/chatContextComponent";
import { Channel } from '../dto/channels.dto'
import { MemberList } from "../components/Chat/Members/MemberList";
import { Accordeon } from "../components/Menu/Accordeon";

export async function loader()
{
	const res = await getUserMeModal(new URLSearchParams({ 'channels': 'true' }));
	if (res.status !== 200)
	{
		return redirect('/login');
	}
	const user = await res.json();
	return ({user});
}

export function Chat()
{
	const state = useContext(ChatContext).ChatState;
	const data: any = useLoaderData();
	const { user } = data;

	return (
		<div className="flex w-full h-full">
			<div className="bg-gray-600 w-full h-full rounded drop-shadow-lg
							md:w-52
							text-gray-300">
				<a href='#' className="flex flex-row gap-4 mx-3 mt-3 items-center h-12
								text-xl cursor-pointer rounded
								hover:bg-gray-500 hover:text-white
								focus:bg-gray-500 focus:text-white	">
					<FaUserFriends size='20' className="ml-3" />
					Friends
				</a>
				<Accordeon title={'Private Messages'}>
						<p>Coucou !</p>
						<p>Coucou !</p>
						<p>Coucou !</p>
						<p>Coucou !</p>
				</Accordeon>
				<Accordeon title={'Your channels'}>
						<p>Channels</p>
						<p>Channels</p>
						<p>Channels</p>
						<p>Channels</p>
						<p>Channels</p>
				</Accordeon>
				<Accordeon title={'Public channels'}>
						<p>Public</p>
						<p>Public</p>
						<p>Public</p>
						<p>Public</p>
						<p>Public</p>
						<p>Public</p>
				</Accordeon>
			</div>
		</div>
	)
}
