import { useContext, useEffect} from "react";
import { redirect, useLoaderData, useSearchParams } from "react-router-dom";
import { getUser, getUserMeModal } from "../requests";
import ChatContext from '../components/Chat/Context/chatContext'
import { ChatSidebar } from "../components/Menu/ChatSideBar";
import { ChatDisplay } from "../components/Chat/ChatDisplay/ChatDisplay";
import ContextMenuContext from "../components/Chat/ContextMenu/context-menu-context";
import { ContextMenu } from "../components/Chat/ContextMenu/ContextMenu";
import { ChatUserList } from "../components/Chat/ChatUserList/ChatUserList";
import { Channel } from "../dto/channels.dto";
import * as events from '../../../shared/constants'
import SocketContext from "../components/Socket/socket-context";

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
	// const mainCtx = useContext(SocketContext);
	const ctx = useContext(ChatContext);
	const state = ctx.ChatState;
	const data: any = useLoaderData();
	const { user } = data;
	const contextMenu = useContext(ContextMenuContext).ContextMenuState;
	const channels = ctx.ChatState.visibleChannels;

	const [params, setParams] = useSearchParams();

	async function sendPrivmsg(userName: string)
	{
		const res = await getUser(userName);
		const target = await res.json();
		const channelName = target.id > user.id ? target.id + '_' + user.id : user.id + '_' + target.id;
		const channelExists: Channel | undefined = channels.find((c) => c.channelName === channelName);

		if (!channelExists)
		{
			ctx.ChatState.socket?.emit(events.NEW_PRIVMSG, { userId: target.id });
		}
		ctx.ChatDispatch({ type: 'update_active', payload: channelExists });
	}

	useEffect(() =>
	{
		const action = params.get('action');
		const userName = params.get('userName');
		if (!action)
			return;
		if (action === 'privmsg')
		{
			if (!userName)
			{
				return;
			}
			setParams(new URLSearchParams())
			sendPrivmsg(userName);
		}
	}, [params])

	return (
		<>
		{
			contextMenu ?
			<ContextMenu
			x={contextMenu.x}
			y={contextMenu.y}
			channel={contextMenu.channel}
			target={contextMenu.target} />
			:
			<></>
			
		}
			<div className="flex flex-col md:flex-row">
				<ChatSidebar user={user} />
				<div className="text-white flex-1 h-screen overflow-hidden justify-self-center mr-auto bg-gray-800">
					{
						state.activeChannel ?	
						<ChatDisplay currentUser={user}/>
						:
						<>
				
						<ChatUserList />
						</>
					}
				</div>
			</div>
		</>
	)
}