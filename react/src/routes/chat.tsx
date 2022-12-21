import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import io, { Socket } from 'socket.io-client'

import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { backURL, getUserMe, getUserMeModal } from "../requests";
import { ChannelList } from "../components/Chat/Channels/ChannelList";
import ChatContext, { ChatChannelDto } from '../components/Chat/Context/chatContext'
import { useSocket } from "../hooks/use-socket";
import { ChatContextComponent } from "../components/Chat/Context/chatContextComponent";
import { Channel } from '../dto/channels.dto'
import { MemberList } from "../components/Chat/Members/MemberList";

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

	// console.info('IN CHAT COMPONENT  ',{state})
	return (
		<h1>Chat</h1>
	)
}
