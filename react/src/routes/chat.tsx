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
import { ChatSidebar } from "../components/Menu/ChatSideBar";
import { ChatWindow } from "../components/Chat/ChatWindow/ChatWindow";
import { ChatDisplay } from "../components/Chat/ChatDisplay/ChatDisplay";

export async function loader()
{
	const res = await getUserMeModal(new URLSearchParams({ 'channels': 'true' }));
	if (res.status !== 200)
	{
		return redirect('/login');
	}
	const user = await res.json();
	return ({ user });
}

export function Chat()
{
	const ctx = useContext(ChatContext);
	const state = ctx.ChatState;
	const data: any = useLoaderData();
	const { user } = data;

	return (
		<div className="flex flex-col md:flex-row">
			<ChatSidebar user={user} />
			<div className="text-white basis-full overflow-auto justify-self-center mr-auto bg-gray-800">
				{
					state.activeChannel ?
						<ChatDisplay currentUser={user} />
						:
						<h1 className="text-5xl text-center">Friends</h1>
				}
			</div>
		</div>
	)
}
